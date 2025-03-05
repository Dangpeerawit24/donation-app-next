import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LINE_API_URL = "https://api.line.me/v2/bot/profile/";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Webhook Received:", body);

    if (body.events && Array.isArray(body.events)) {
      for (const event of body.events) {
        const userId = event?.source?.userId;
        if (!userId) continue;

        try {
          // ดึงข้อมูลโปรไฟล์จาก LINE API
          const profile = await getProfile(userId);
          if (profile) {
            // บันทึกข้อมูลลงฐานข้อมูล (ใช้ upsert กับ model Line_users)
            await prisma.line_users.upsert({
              where: { user_id: userId },
              update: {
                display_name: profile.displayName,
                picture_url: profile.pictureUrl ?? null,
              },
              create: {
                user_id: userId,
                display_name: profile.displayName,
                picture_url: profile.pictureUrl ?? null,
              },
            });

            console.log("User Profile Saved:", { userId });
          }
        } catch (error) {
          console.error("Error processing Webhook:", error);
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error handling Webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * ดึงข้อมูลโปรไฟล์ผู้ใช้จาก LINE API
 */
async function getProfile(userId) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  try {
    const response = await fetch(`${LINE_API_URL}${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting user profile:", { userId, error });
    return null;
  }
}
