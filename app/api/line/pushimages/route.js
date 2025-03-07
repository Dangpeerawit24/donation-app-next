import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    const UPLOAD_DIR = path.join(process.cwd(), "uploads/img/pushimages");

    // ตรวจสอบว่าไดเรกทอรีมีอยู่หรือไม่ ถ้าไม่มีให้สร้างใหม่
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // ดึงข้อมูลจากฟอร์ม
    const id = Number(formData.get("id"));
    const userid = formData.get("userid");
    const campaignsname = formData.get("campaignsname");
    const pushmessage = 1;

    // ดึงไฟล์จากฟอร์ม (รองรับหลายไฟล์)
    let files = formData.getAll("url_img[]");
    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing file" }),
        { status: 400 }
      );
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const imageUrls = [];
    const newFileNames = [];

    // Loop ตรวจสอบไฟล์แต่ละไฟล์
    for (const file of files) {
      // ตรวจสอบนามสกุลไฟล์
      const fileExt = path.extname(file.name);
      if (!allowedExtensions.includes(fileExt.toLowerCase())) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid file type" }),
          { status: 400 }
        );
      }

      // สร้างชื่อไฟล์ใหม่ที่ไม่ซ้ำกัน
      const randomInt = Math.floor(Math.random() * 9000) + 1000;
      const newFileName = `${Date.now()}${randomInt}${fileExt}`;
      const newFilePath = path.join(UPLOAD_DIR, newFileName);
      // เก็บ path สำหรับบันทึกลง DB (ใช้ public path)
      const fileNameForDb = `/api/uploads/img/pushimages/${newFileName}`;

      // แปลงไฟล์เป็น buffer และเขียนลงดิสก์
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.promises.writeFile(newFilePath, fileBuffer);

      imageUrls.push(fileNameForDb);
      newFileNames.push(newFileName);
    }

    // ดึงข้อมูลไฟล์เดิมจากฐานข้อมูล (ถ้ามี) เพื่อผนวกกับไฟล์ใหม่
    const existingRecord = await prisma.campaign_transactions.findUnique({
      where: { id: id },
      select: { url_img: true },
    });

    let updatedFileNamesString = newFileNames.join(",");
    if (existingRecord && existingRecord.url_img) {
      updatedFileNamesString = existingRecord.url_img + "," + updatedFileNamesString;
    }

    // อัปเดตข้อมูลในฐานข้อมูล (update row ที่มี id เท่ากับ transactionID)
    const updatedTransaction = await prisma.campaign_transactions.update({
      data: {
        status: "ส่งภาพกองบุญแล้ว",
        url_img: updatedFileNamesString,
      },
      where: {
        id: id,
      },
    });

    // ส่ง push message ผ่าน LINE API หาก pushmessage > 0
    if (pushmessage && Number(pushmessage) > 0) {
      const lineAccessToken = process.env.NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN;
      // ส่งรูปภาพทีละภาพ
      for (const imageUrl of imageUrls) {
        await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lineAccessToken}`,
          },
          body: JSON.stringify({
            to: userid,
            messages: [
              {
                type: "image",
                // ประกอบ URL ให้ครบถ้วนโดยใช้ NEXT_PUBLIC_BASE_URL
                originalContentUrl: process.env.NEXT_PUBLIC_BASE_URL + imageUrl,
                previewImageUrl: process.env.NEXT_PUBLIC_BASE_URL + imageUrl,
              },
            ],
          }),
        });
      }

      // // ส่งข้อความหลังจากส่งรูปทั้งหมด
      // const textMessage = `ภาพจากกองบุญ\n${campaignsname}\nขออนุโมทนาครับ🙏`;
      // await fetch("https://api.line.me/v2/bot/message/push", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${lineAccessToken}`,
      //   },
      //   body: JSON.stringify({
      //     to: userid,
      //     messages: [
      //       {
      //         type: "text",
      //         text: textMessage,
      //       },
      //     ],
      //   }),
      // });
    }

    return new Response(
      JSON.stringify({ success: true, data: updatedTransaction }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting form:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
