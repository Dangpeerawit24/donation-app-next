import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// ✅ อ่านข้อมูลสมาชิกทั้งหมด
export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: 'เปิดกองบุญ',
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
    },
  });
  
  return NextResponse.json(campaigns);
}
