import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const topics = await prisma.topic.findMany({
    where: { status: "อยู่ในช่วงงาน" }, // 📌 ดึงเฉพาะหัวข้อที่ถูกเก็บถาวร
  });

  return NextResponse.json(topics);
}