import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id"), 10);

  const campaigns = await prisma.$queryRaw`
              SELECT * FROM Campaign_transactions WHERE campaignsid = ${id} AND status != "รอดำเนินการ"
            `;

 return NextResponse.json(campaigns);
}


export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id"), 10);

    const campaignssucceed = await prisma.campaign_transactions.updateMany({
      where: { 
        campaignsid: id,
        form: { in: ["P", "IB", "L"] }
      },
      data: { status: "ส่งภาพกองบุญแล้ว" },
    });    


    return new Response(JSON.stringify({ success: true, data: campaignssucceed }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
