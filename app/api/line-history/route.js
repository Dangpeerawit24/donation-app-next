import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();


export async function GET() {
  const line_users = await prisma.line_users.findMany({orderBy: { id: 'desc' }});
  return NextResponse.json(line_users);
}
