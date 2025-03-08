"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoginButton from "@/components/LoginWithLineButton";
import Swal from "sweetalert2";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("error") === "OAuthCallback" || urlParams.get("error") === "Callback") {
      Swal.fire({
        icon: "error",
        title: "ไม่พบบัญชีที่เชื่อมโยงกับ LINE",
        text: "กรุณาเข้าสู่ระบบด้วยอีเมล หรือสมัครสมาชิกก่อน",
        confirmButtonText: "ตกลง",
      }).then(() => {
        router.replace("/login"); // ✅ รีเฟรช URL ไม่ให้เห็น error query
      });
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "moderator") {
        router.push("/moderator/dashboard");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // ล้าง Error ก่อนล็อกอิน

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // ❌ ปิด redirect อัตโนมัติ
    });

    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  // ถ้า session กำลังโหลด ให้แสดง Loading
  // if (status === "loading") {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="text-center text-xl font-semibold">กำลังโหลด...</div>
  //     </div>
  //   );
  // }

  if (status === "loading") {
    return null;
  }

  return (
    <div className="flex min-h-screen p-4 items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600">
      <div className="w-full max-w-md p-8 space-y-6 bg-white  shadow-md rounded-lg">
        <div>
          <h1 className="text-2xl font-bold text-center text-gray-900 ">
            เข้าสู่ระบบ
          </h1>
          <h1 className="text-xl font-bold text-center text-gray-900 ">
            จัดการกองบุญออนไลน์
          </h1>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 ">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 ">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="flex items-center justify-between">
          <hr className="w-full border-gray-300" />
          <span className="px-2 text-gray-500 ">หรือ</span>
          <hr className="w-full border-gray-300 " />
        </div>

        <LoginButton />
      </div>
    </div>
  );
}
