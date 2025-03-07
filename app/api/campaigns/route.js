import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";

const prisma = new PrismaClient();

// ✅ อ่านข้อมูลสมาชิกทั้งหมด
export async function GET() {
  const campaigns = await prisma.$queryRaw`
        SELECT 
    c.*, 
    COALESCE(SUM(ct.value), 0) AS total_value
  FROM Campaign c
  LEFT JOIN Campaign_transactions ct ON c.id = ct.campaignsid
  WHERE c.status = 'เปิดกองบุญ'
  GROUP BY c.id
      `;

  return NextResponse.json(campaigns);
}

// ✅ เพิ่มสมาชิกใหม่
export async function POST(req) {
  try {
    const formData = await req.formData();

    const UPLOAD_DIR = path.join(process.cwd(), "uploads/img/campaigns");

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const name = formData.get("name");
    const description = formData.get("description");
    const price = parseInt(formData.get("price"), 10);
    const stock = parseInt(formData.get("stock"), 10);
    const status = formData.get("status");
    const topicId = parseInt(formData.get("topicId"), 10);
    const Broadcast = formData.get("Broadcast");
    const details = formData.get("details");
    const respond = formData.get("respond");
    const file = formData.get("campaign_img");
    const randomInt = Math.floor(Math.random() * 9000) + 1000
    const detailsname = "true";
    const detailsbirthdate = "true";
    const detailstext = "true";
    const detailswish = "true";


    const fileExt = path.extname(file.name);
    const newFileName = `${Date.now()}${randomInt}${fileExt}`;
    const newFilePath = path.join(UPLOAD_DIR, newFileName);
    const URL = process.env.NEXT_PUBLIC_BASE_URL;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(newFilePath, fileBuffer);
    const campaign_img = `/api/uploads/img/campaigns/${newFileName}`;

    if (details === "ชื่อสกุล") {
      const campaign = await prisma.campaign.create({
        data: {
          name,
          description,
          price,
          topicId,
          stock,
          detailsname,
          status,
          respond,
          campaign_img,
        },
      });
    } else if (details === "ชื่อวันเดือนปีเกิด") {
      const campaign = await prisma.campaign.create({
        data: {
          name,
          description,
          price,
          topicId,
          stock,
          detailsname,
          detailsbirthdate,
          status,
          respond,
          campaign_img,
        },
      });
    } else if (details === "กล่องข้อความใหญ่") {
      const campaign = await prisma.campaign.create({
        data: {
          name,
          description,
          price,
          topicId,
          stock,
          detailstext,
          status,
          respond,
          campaign_img,
        },
      });
    } else if (details === "คำอธิษฐาน") {
      const campaign = await prisma.campaign.create({
        data: {
          name,
          description,
          price,
          topicId,
          stock,
          detailsname,
          detailswish,
          status,
          respond,
          campaign_img,
        },
      });
    } else if (details === "ตามศรัทธา") {
      const campaign = await prisma.campaign.create({
        data: {
          name,
          description,
          price,
          topicId,
          stock,
          detailsname,
          status,
          respond,
          campaign_img,
        },
      });
    } else if (details === "ตามศรัทธาคำอธิษฐาน") {
      const campaign = await prisma.campaign.create({
        data: {
          name,
          description,
          price,
          topicId,
          stock,
          detailsname,
          detailswish,
          status,
          respond,
          campaign_img,
        },
      });
    }



    if (status === "เปิดกองบุญ") {
      const lineToken = process.env.NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN;
      const linkapp = process.env.NEXT_PUBLIC_LIFF_APP;
      const priceMessage = price === 1 ? "ตามกำลังศรัทธา" : `${price} บาท`;

      const message = `🎉 ขอเชิญร่วมกองบุญ 🎉\n✨ ${name}\n💰 ร่วมบุญ: ${priceMessage}\n📋 ${description}`;
      const message2 = `แสดงหลักฐานการร่วมบุญ\n💰 มูลนิธิเมตตาธรรมรัศมี\nธ.กสิกรไทย เลขที่บัญชี 171-1-75423-3\nธ.ไทยพาณิชย์ เลขที่บัญชี 649-242269-4\n\n📌 ร่วมบุญผ่านระบบกองบุญออนไลน์ได้ที่: ${linkapp}`;
      const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${campaign_img}`;
      // const imageUrl = "https://donation.kuanimtungpichai.com/img/campaign/1735741831.png"

      let userIds = [];

      // ตรวจสอบว่าเลือก Broadcast แบบไหน
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
        // ดึง userIds ตามช่วงเวลาที่เลือก
        if (Broadcast === "3months") {
          userIds = await prisma.line_users.findMany({
            where: {
              updatedAt: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
              },
            },
            select: { user_id: true },
          });
        } else if (Broadcast === "year") {
          userIds = await prisma.line_users.findMany({
            where: {
              updatedAt: {
                gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
              },
            },
            select: { user_id: true },
          });
        }

        // ส่งข้อความแบบ Multicast (แบ่ง user เป็นกลุ่มละ 500)
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
                to: chunk.map(user => user.userId),
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

    return NextResponse.json({ message: "เพิ่มกองบุญเรียบร้อย" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มกองบุญได้" },
      { status: 500 }
    );
  }
}

// ✅ แก้ไขข้อมูลสมาชิก
export async function PUT(req) {
  const { id, status, details, respond, name, description, price, stock } = await req.json();
  const detailsname = "true";
  const detailsbirthdate = "true";
  const detailstext = "true";
  const detailswish = "true";

  try {
    if (details === "ชื่อสกุล") {
      var campaign = await prisma.campaign.update({
        where: { id },
        data: { status, detailsname, respond, name, description, price, stock },
      });
    } else if (details === "ชื่อวันเดือนปีเกิด") {
      var campaign = await prisma.campaign.update({
        where: { id },
        data: { status, detailsname, detailsbirthdate, respond, name, description, price, stock },
      });
    } else if (details === "กล่องข้อความใหญ่") {
      var campaign = await prisma.campaign.update({
        where: { id },
        data: { status, detailstext, respond, name, description, price, stock },
      });
    } else if (details === "คำอธิษฐาน") {
      var campaign = await prisma.campaign.update({
        where: { id },
        data: { status, detailsname, detailswish, respond, name, description, price, stock },
      });
    } else if (details === "ตามศรัทธา") {
      var campaign = await prisma.campaign.update({
        where: { id },
        data: { status, detailsname, respond, name, description, price, stock },
      });
    } else if (details === "ตามศรัทธาคำอธิษฐาน") {
      var campaign = await prisma.campaign.update({
        where: { id },
        data: { status, detailsname, detailswish, respond, name, description, price, stock },
      });
    }


    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ error: "ไม่สามารถอัปเดตข้อมูลได้" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    // ค้นหา campaign เพื่อนำชื่อไฟล์รูปมาใช้
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { campaign_img: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const filePath = campaign.campaign_img;

    if (filePath) {
      const absolutePath = path.join(process.cwd(), "public", filePath);

      // ตรวจสอบว่าไฟล์มีอยู่ก่อนลบ
      if (fs.existsSync(absolutePath)) {
        try {
          await fsPromises.unlink(absolutePath);
          console.log(`File deleted: ${absolutePath}`);
        } catch (error) {
          console.error(`Failed to delete file: ${absolutePath}`, error);
        }
      } else {
        console.warn(`File not found: ${absolutePath}`);
      }
    }

    // ลบข้อมูลแคมเปญจากฐานข้อมูล
    await prisma.campaign.delete({ where: { id } });


    return NextResponse.json({ message: "Deleted successfully" });

  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}