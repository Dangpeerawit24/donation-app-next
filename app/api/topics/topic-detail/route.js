import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id"), 10);
  console.log(id);
  const campaigns = await prisma.$queryRaw`
 SELECT 
    c.*, 
    COALESCE(SUM(ct.value), 0) AS total_value
  FROM Campaign c
  LEFT JOIN Campaign_transactions ct ON c.id = ct.campaignsid
  WHERE c.topicId = ${id}
  GROUP BY c.id
  `;

 return NextResponse.json(campaigns);
}
