import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    console.log(body);

    if (body)
      {
        try {
          await prisma.fb_message.create(
            {
              data: {
                fb_id: body.id,
                name: body.name,
                message: body.message,
              },
            }
          )
        } catch (error) {
          console.error("Error processing Webhook:", error);
        }
      }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error handling Webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
