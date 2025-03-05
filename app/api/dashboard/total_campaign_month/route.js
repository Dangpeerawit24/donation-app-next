import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const currentMonth = new Date().getMonth() + 1; 
  const currentYear = new Date().getFullYear();

  const result = await prisma.$queryRaw`
    SELECT COUNT(*) AS count
    FROM Campaign
    WHERE MONTH(createdAt) = ${currentMonth}
      AND YEAR(createdAt) = ${currentYear}
  `;

  const campaignCount = result[0].count;
  
  return NextResponse.json(Number(campaignCount));
}
