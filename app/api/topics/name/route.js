import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id"), 10);
  console.log(id);
  
  const topics = await prisma.topic.findMany({
    where: { id: id }
  });

 return NextResponse.json(topics);
}
