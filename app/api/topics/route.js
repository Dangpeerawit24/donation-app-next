import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const topics = await prisma.$queryRaw`
    SELECT 
  c.*, 
  COUNT(camp.id) AS total_campaigns, 
  COALESCE(SUM(COALESCE(trans.total_value, 0) * COALESCE(camp.price, 0)), 0) AS total_value_price
  FROM Topic AS c
  LEFT JOIN Campaign AS camp ON c.id = camp.topicId
  LEFT JOIN (
  SELECT 
  campaignsid, 
  SUM(value) AS total_value
  FROM Campaign_transactions
  GROUP BY campaignsid
  ) AS trans ON camp.id = trans.campaignsid
  GROUP BY c.id, c.name;
  
  `

  const sanitizedTopics = topics.map(topic => ({
    ...topic,
    id: topic.id.toString(),  // ถ้า id เป็น BigInt
    total_campaigns: Number(topic.total_campaigns), // แปลงเป็น Number ป้องกันปัญหา
    total_value_price: topic.total_value_price ? topic.total_value_price.toString() : "0", // ป้องกัน null
  }));
  return NextResponse.json(sanitizedTopics);
}

// ✅ เพิ่มสมาชิกใหม่
export async function POST(req) {
  try {
    const { name, status } = await req.json();

    // สร้าง user ใหม่
    const topic = await prisma.topic.create({
      data: {
        name,
        status,
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มสมาชิกได้" },
      { status: 500 }
    );
  }
}

// ✅ แก้ไขข้อมูลสมาชิก
export async function PUT(req) {
  const { id, name, status } = await req.json();

  try {
    const topic = await prisma.topic.update({
      where: { id },
      data: { name, status },
    });



    return NextResponse.json(topic);
  } catch (error) {
    return NextResponse.json({ error: "ไม่สามารถอัปเดตข้อมูลได้" }, { status: 500 });
  }
}

// ✅ ลบสมาชิก
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const numericId = Number(id); // ✅ แปลง id เป็นตัวเลข

    if (isNaN(numericId) || numericId <= 0) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const topic = await prisma.topic.findUnique({ where: { id: numericId } });

    if (!topic) {
      return NextResponse.json({ message: "Topic not found" }, { status: 404 });
    }

    if (topic.status === "อยู่ในช่วงงาน") {
      await prisma.topic.delete({ where: { id: numericId } });
    } else {
      return NextResponse.json({ message: "Cannot delete this topic" }, { status: 400 });
    }



    return NextResponse.json({ message: "Topic deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting topic", error: error.message },
      { status: 500 }
    );
  }
}



