import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!code) {
    return NextResponse.redirect(new URL("/line?error=LINE login failed", req.url));
  }

  try {
    const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI,
        client_id: process.env.NEXT_PUBLIC_LINE_LOGIN_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_LINE_LOGIN_CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenResponse.json();

    const profileResponse = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileResponse.json();

    // รอค่า cookies ก่อนใช้งาน
    const cookieStore = await cookies();
    cookieStore.set("profile", JSON.stringify(profile), {
      maxAge: 60 * 60 * 24,
      httpOnly: false,
    });

    return NextResponse.redirect(new URL(baseUrl+"/line/index", req.url));
  } catch (error) {
    console.error("LINE OAuth Error:", error.response?.data || error.message);
    return NextResponse.redirect(new URL(baseUrl+"/line?error=Failed to authenticate with LINE", req.url));
  }
}
