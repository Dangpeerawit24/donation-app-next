import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
const prisma = new PrismaClient();
import QRCode from "qrcode";
import crypto from "crypto";

export async function POST(req) {
  try {
    const formData = await req.formData();

    // เปลี่ยนโฟลเดอร์เก็บจาก public ไปที่ uploads/slip
    const UPLOAD_DIR = path.join(process.cwd(), "uploads/img/slip");

    // ตรวจสอบว่าไดเรกทอรีมีอยู่หรือไม่ ถ้าไม่มีให้สร้างใหม่
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // ดึงข้อมูลจากฟอร์ม
    const name = formData.get("name");
    const details = formData.get("details");
    const donationQuantity = formData.get("donationQuantity");
    const detailstext = formData.get("detailstext");
    const detailswish = formData.get("detailswish");
    const birthdate = formData.get("birthdate");
    const month = formData.get("month");
    const year = formData.get("year");
    const constellation = formData.get("constellation");
    const birthtime = formData.get("birthtime");
    const age = formData.get("age");
    const campaignsid = formData.get("campaignsid");
    const campaignsname = formData.get("campaignsname");
    const lineId = formData.get("lineId");
    const lineName = formData.get("lineName");
    let respond = formData.get("respond");
    let pushmessage = formData.get("pushmessage");
    const file = formData.get("file");

    // ประกาศตัวแปรสำหรับ status และ respondtouser
    let status, respondtouser;
    if (respond === "แอดมินจะส่งภาพกองบุญให้ท่านได้อนุโมทนาอีกครั้ง") {
      status = "รอดำเนินการ";
      respondtouser = "แอดมินจะส่งภาพกองบุญให้ท่านได้อนุโมทนาอีกครั้ง";
    } else {
      status = "ข้อมูลของท่านเข้าระบบแล้ว";
      respondtouser = "ข้อมูลของท่านเข้าระบบแล้ว";
    }

    // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
    if (!file) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing file" }),
        { status: 400 }
      );
    }

    // ตรวจสอบนามสกุลไฟล์
    const fileExt = path.extname(file.name);
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
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
    // เปลี่ยนจาก public/img/slip เป็น /uploads/slip
    const fileName = `/api/uploads/img/slip/${newFileName}`;

    // แปลงไฟล์เป็น buffer และเขียนลงดิสก์
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(newFilePath, fileBuffer);

    // สร้าง transactionID แบบสุ่ม
    const transactionID = crypto.randomBytes(16).toString("hex");

    // สร้าง QR Code
    const qrData = `${process.env.NEXT_PUBLIC_BASE_URL}/line/pushimages/${transactionID}`;
    // สามารถเก็บ QR Code ใน public ได้เหมือนเดิม
    const qrFolder = path.join(process.cwd(), "/uploads/img/qrcodes");
    if (!fs.existsSync(qrFolder)) {
      fs.mkdirSync(qrFolder, { recursive: true });
    }
    const qrFileName = `qrcode_${Date.now()}_${Math.floor(Math.random() * 10000)}.png`;
    const qrFilePath = path.join(qrFolder, qrFileName);
    await QRCode.toFile(qrFilePath, qrData, {
      width: 300,
    });
    const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/uploads/img/qrcodes/${qrFileName}`;

    // สร้างข้อมูลใหม่ในฐานข้อมูล
    const newTransaction = await prisma.campaign_transactions.create({
      data: {
        details: details,
        detailsname: name,
        detailstext: detailstext,
        detailswish: detailswish,
        detailsbirthdate: birthdate,
        detailsbirthmonth: month,
        detailsbirthyear: year,
        detailsbirthconstellation: constellation,
        detailsbirthtime: birthtime,
        detailsbirthage: age,
        lineId: lineId,
        lineName: lineName,
        transactionID: transactionID,
        slip: fileName,
        campaignsname: campaignsname,
        campaignsid: Number(campaignsid),
        form: "A",
        value: donationQuantity,
        status: status,
        notify: "1",
        qr_url: qrUrl,
      },
    });

    if (Number(pushmessage) > 0) {
      const lineAccessToken = process.env.NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN;
      const Text = `🙏 ขออนุโมทนากับคุณ ${lineName}\n✨ ที่ร่วมกองบุญ ${campaignsname}\n${respondtouser}`;

      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lineAccessToken}`,
        },
        body: JSON.stringify({
          to: lineId,
          messages: [
            {
              type: "text",
              text: Text,
            },
          ],
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, data: newTransaction }),
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
