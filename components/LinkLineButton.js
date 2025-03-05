import { useSession } from "next-auth/react";
import { useState } from "react";
import Swal from "sweetalert2";

export default function LinkLineButton() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);

    const handleLinkLine = async () => {
        setLoading(true);

        try {
            // 🔹 ส่งผู้ใช้ไปล็อกอินกับ LINE โดยใช้ Client ID เฉพาะ Link
            const clientId = process.env.NEXT_PUBLIC_LINE_LINK_CLIENT_ID;
            const redirectUri = process.env.NEXT_PUBLIC_LINE_LINK_URI;; // 🔹 Callback สำหรับ Link
            const state = Math.random().toString(36).substring(7);

            const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;

            window.location.href = lineAuthUrl;
        } catch (error) {
            console.error("Error linking LINE:", error);
            Swal.fire("เกิดข้อผิดพลาด", "โปรดลองอีกครั้ง", "error");
        }

        setLoading(false);
    };

    return (
        <>
            {!session?.user?.lineuid && (
                <button
                    onClick={handleLinkLine}
                    disabled={loading}
                    className="block w-full px-4 py-2 text-left text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {loading ? "กำลังเชื่อมต่อ..." : "เชื่อมต่อ LINE"}
                </button>
            )}
        </>
    );
}
