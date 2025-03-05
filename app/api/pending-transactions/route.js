import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const transactions = await prisma.$queryRaw`
    SELECT 
      Campaign.name AS campaign_name,
      Campaign.id AS campaign_id,
      COUNT(Campaign_transactions.id) AS total_transactions
    FROM Campaign_transactions
    JOIN Campaign ON Campaign_transactions.campaignsid = Campaign.id
    WHERE Campaign.status = 'เปิดกองบุญ'
      AND (
        Campaign_transactions.status = 'รอดำเนินการ'
        OR Campaign_transactions.status = 'แอดมินจะส่งภาพกองบุญให้ท่านได้อนุโมทนาอีกครั้ง'
      )
    GROUP BY Campaign.name, Campaign.id
  `;

  // แปลง BigInt ให้เป็น Number (หรือ String ตามที่ต้องการ)
  const safeTransactions = transactions.map((t) => ({
    ...t,
    total_transactions: Number(t.total_transactions),
  }));

  return NextResponse.json(safeTransactions);
}
