import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const currentYear = new Date().getFullYear();

  const result = await prisma.$queryRaw`
  SELECT COALESCE(SUM(trans.value * camp.price), 0) AS total_value
  FROM Campaign_transactions AS trans
  JOIN Campaign AS camp ON trans.campaignsid = camp.id
  WHERE YEAR(camp.createdAt) = ${currentYear}
`;

  const totalValue = result[0].total_value;

  return NextResponse.json(Number(totalValue));
}