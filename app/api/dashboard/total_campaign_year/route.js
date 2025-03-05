import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";


const prisma = new PrismaClient();

export async function GET() {
  const currentYear = new Date().getFullYear();

const result = await prisma.$queryRaw`
  SELECT COUNT(*) AS count
  FROM Campaign
  WHERE YEAR(createdAt) = ${currentYear}
`;

const campaignCount = result[0].count;

  return NextResponse.json(Number(campaignCount));
}
