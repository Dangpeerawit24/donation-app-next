"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [Campaigns, setCampaigns] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "admin") {
      Swal.fire({
        title: "ปฏิเสธการเข้าถึง",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        icon: "error",
      }).then(() => router.push("/login"));
    } else {
      // fetchUsers();
      setLoading(false);
    }
  }, [session, status, router]);


  if (loading) {
    return (
      <div
        id="loader"
        className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-blue-400 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-100">
      <Navbar />
      {/* Content */}
      <main className="p-6 ">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 ">
            ยินดีต้อนรับ, {session?.user?.email}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            บทบาท: {session?.user?.role}
          </p>
        </div>

        {/* การ์ดข้อมูล */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white  p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-800 ">
              จำนวนผู้ใช้
            </h3>
            <p className="text-2xl font-bold text-blue-600">1,234</p>
          </div>

          <div className="bg-white  p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-800 ">
              ยอดขายวันนี้
            </h3>
            <p className="text-2xl font-bold text-green-600">฿25,000</p>
          </div>

          <div className="bg-white  p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-800 ">
              คำสั่งซื้อที่รอดำเนินการ
            </h3>
            <p className="text-2xl font-bold text-orange-600">15</p>
          </div>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}
