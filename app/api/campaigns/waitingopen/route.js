import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { EventEmitter } from "events";
import fs from "fs";
import path from "path";


const prisma = new PrismaClient();
if (!global.userEvent) {
  global.userEvent = new EventEmitter();
  global.userEvent.setMaxListeners(20); // ✅ ป้องกัน MaxListenersExceededWarning
}
const userEvent = global.userEvent;

// ✅ อ่านข้อมูลสมาชิกทั้งหมด
export async function GET(req) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendData = async () => {
        const campaigns = await prisma.$queryRaw`
        SELECT * FROM campaign WHERE status = "รอเปิด"
      `;

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(campaigns)}\n\n`));
      };

      await sendData();

      userEvent.removeAllListeners("update");
      userEvent.on("update", () => {
        console.log("Update event triggered");
      });
      
      userEvent.on("update", sendData);

      return () => {
        isConnectionOpen = false;
        clearInterval(heartbeat);
      
        // ✅ ป้องกันการเรียก enqueue() หลังจากปิดไปแล้ว
        try {
          controller.close();
        } catch (error) {
          console.warn("⚠️ Controller ปิดอยู่แล้ว", error);
        }
      
        console.log("❌ SSE Connection Closed");
      };
      
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Transfer-Encoding": "chunked",
    },
  });
}

export async function POST(req) {
  try {
    const { id, status, Broadcast } = await req.json();
    const numericId = Number(id); 

    const URL = process.env.NEXT_PUBLIC_BASE_URL;
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const linkapp = process.env.NEXT_PUBLIC_LIFF_APP;

    // ✅ ดึงข้อมูลกองบุญจากฐานข้อมูล
    const campaign = await prisma.campaign.update({
      where: { id: numericId },
      data: { status },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // ✅ ดึงข้อมูลที่ต้องใช้ในข้อความ
    const { name, price, description } = campaign;
    const priceMessage = price === 1 ? "ตามกำลังศรัทธา" : `${price} บาท`;
    const message = `🎉 ขอเชิญร่วมกองบุญ 🎉\n✨ ${name}\n💰 ร่วมบุญ: ${priceMessage}\n📋 ${description}`;
    const message2 = `แสดงหลักฐานการร่วมบุญ\n💰 มูลนิธิเมตตาธรรมรัศมี\nธ.กสิกรไทย เลขที่ 171-1-75423-3\nธ.ไทยพาณิชย์ เลขที่ 649-242269-4\n\n📌 ร่วมบุญผ่านระบบกองบุญออนไลน์ได้ที่: ${linkapp}`;
    const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${campaign_img}`;
    // const imageUrl = "https://donation.kuanimtungpichai.com/img/campaign/1735741831.png";

    let userIds = [];

    // ✅ ตรวจสอบว่าต้อง Broadcast หรือไม่
    if (status === "เปิดกองบุญ") {
      if (Broadcast === "Broadcast") {
        await fetch("https://api.line.me/v2/bot/message/broadcast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lineToken}`,
          },
          body: JSON.stringify({
            messages: [
              { type: "image", originalContentUrl: imageUrl, previewImageUrl: imageUrl },
              { type: "text", text: message },
              { type: "text", text: message2 },
            ],
          }),
        });
      } else {
        // ✅ ดึง userId ตามช่วงเวลาที่เลือก
        if (Broadcast === "3months") {
          userIds = await prisma.line_users.findMany({
            where: {
              createdAt: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
              },
            },
            select: { user_id: true }, // ✅ ตรวจสอบโครงสร้าง Prisma
          });
        } else if (Broadcast === "year") {
          userIds = await prisma.line_users.findMany({
            where: {
              createdAt: {
                gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
              },
            },
            select: { user_id: true }, // ✅ ตรวจสอบโครงสร้าง Prisma
          });
        }

        // ✅ ส่งข้อความแบบ Multicast (แบ่ง user เป็นกลุ่มละ 500)
        if (userIds.length > 0) {
          const userIdChunks = [];
          for (let i = 0; i < userIds.length; i += 500) {
            userIdChunks.push(userIds.slice(i, i + 500));
          }

          for (const chunk of userIdChunks) {
            await fetch("https://api.line.me/v2/bot/message/multicast", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${lineToken}`,
              },
              body: JSON.stringify({
                to: chunk.map(user => user.user_id), // ✅ ตรวจสอบว่าใช้ user_id หรือ userId ตามฐานข้อมูล
                messages: [
                  { type: "image", originalContentUrl: imageUrl, previewImageUrl: imageUrl },
                  { type: "text", text: message },
                  { type: "text", text: message2 },
                ],
              }),
            });
          }
        }
      }
    }

    userEvent.emit("update");

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    return NextResponse.json(
      { error: "ไม่สามารถเปิดกองบุญได้", details: error.message },
      { status: 500 }
    );
  }
}


// ✅ แก้ไขข้อมูลสมาชิก
export async function PUT(req) {
  const { id, status, details, respond, name, description, price, stock } = await req.json();

  try {
    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status, details, respond, name, description, price, stock },
    });

    userEvent.emit("update");

    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ error: "ไม่สามารถอัปเดตข้อมูลได้" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { id } = await req.json();

  await prisma.campaign.delete({ where: { id } });

  userEvent.emit("update");

  return NextResponse.json({ message: "deleted successfully" });
}

