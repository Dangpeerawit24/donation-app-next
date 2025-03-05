"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { signOut, useSession } from "next-auth/react";

export default function LinkLineCallback() {
  const router = useRouter();

  useEffect(() => {
    const fetchLineToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        console.error("❌ ไม่พบ code ใน URL");
        return;
      }

      console.log("🔹 LINE Authorization Code:", code);

      try {
        // 🔹 ขอ Access Token จาก LINE
        const response = await fetch("https://api.line.me/oauth2/v2.1/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.NEXT_PUBLIC_LINE_LINK_URI,
            client_id: process.env.NEXT_PUBLIC_LINE_LINK_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_LINE_LINK_CLIENT_SECRET,
          }),
        });

        const tokenData = await response.json();
        console.log("🔹 LINE Token Response:", tokenData);

        if (!tokenData.access_token) {
          throw new Error(
            tokenData.error_description || "Failed to get LINE access token"
          );
        }

        // 🔹 ดึงข้อมูลผู้ใช้จาก LINE
        const userProfileResponse = await fetch(
          "https://api.line.me/v2/profile",
          {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          }
        );

        const userProfile = await userProfileResponse.json();
        console.log("🔹 LINE User Profile:", userProfile);

        if (!userProfile.userId) {
          throw new Error("Failed to fetch LINE profile");
        }

        // 🔹 อัปเดต `lineUid` ในฐานข้อมูล
        const linkResponse = await fetch("/api/link-line", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lineUid: userProfile.userId }),
        });

        const linkResult = await linkResponse.json();
        console.log("🔹 Link Response:", linkResult);

        if (linkResult.success) {
          Swal.fire(
            "สำเร็จ!",
            "บัญชี LINE เชื่อมต่อเรียบร้อยแล้วโปรดเข้าสู่ระบบอีกครั้ง",
            "success"
          ).then(() => {
            signOut({ callbackUrl: "/login" })
          });
        } else {
          throw new Error(linkResult.error || "Failed to link LINE account");
        }
      } catch (error) {
        console.error("❌ Error linking LINE:", error);
        Swal.fire("เกิดข้อผิดพลาด", error.message, "error").then(() => {
          router.push("/login");
        });
      }
    };

    fetchLineToken();
  }, [router]);

  return (
    <div
      id="loader"
      className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-400 text-lg font-semibold">
          กำลังดำเนินการเชื่อมต่อบัญชี LINE...
        </p>
      </div>
    </div>
  );
}
