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
  const [campaignCountMonth, setcampaignCountMonth] = useState(true);
  const [campaignCountYear, setcampaignCountYear] = useState(true);
  const [total_value_year, settotal_value_year] = useState(true);
  const [total_value_month, settotal_value_month] = useState(true);
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

  const fetchtotal_campaign_month = async () => {
    try {
      const res = await fetch("/api/dashboard/total_campaign_month");
      const data = await res.json();
      setcampaignCountMonth(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
    }
  };
  const fetchtotal_value_month = async () => {
    try {
      const res = await fetch("/api/dashboard/total_value_month");
      const data = await res.json();
      settotal_value_month(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
    }
  };
  const fetchtotal_campaign_year = async () => {
    try {
      const res = await fetch("/api/dashboard/total_campaign_year");
      const data = await res.json();
      setcampaignCountYear(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
    }
  };
  const fetchtotal_value_year = async () => {
    try {
      const res = await fetch("/api/dashboard/total_value_year");
      const data = await res.json();
      settotal_value_year(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
    }
  };

  useEffect(() => {
    // ฟังก์ชันเรียกข้อมูล
    const fetchData = () => {
      fetchtotal_campaign_month();
      fetchtotal_value_year();
      fetchtotal_campaign_year();
      fetchtotal_value_month();
    };
  
    
    fetchData();
  
    
    const intervalId = setInterval(fetchData, 5000);
  
    return () => clearInterval(intervalId);
  }, []);
  


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
          <h1 className="text-2xl font-bold text-gray-800 ">
            Dashboard
          </h1>
          <h2 className="text-xl font-bold text-gray-800 ">
            ยินดีต้อนรับ, {session?.user?.name}
          </h2>
        </div>

        {/* การ์ดข้อมูล */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white  p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg text-start font-semibold text-gray-800 ">
              ยอดรวมรายรับ (เดือนนี้)
            </h3>
            <p className="mt-2 text-4xl font-bold text-green-600 ">{total_value_month}</p>
          </div>

          <div className="bg-white  p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg text-start font-semibold text-gray-800 ">
              ยอดรวมรายรับ (ปีนี้)
            </h3>
            <p className="mt-2 text-4xl font-bold text-green-600 ">{total_value_year}</p>
          </div>

          <div className="bg-white  p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg text-start font-semibold text-gray-800 ">
            จำนวนกองบุญ (เดือนนี้)
            </h3>
            <p className="mt-2 text-4xl font-bold text-red-600 ">{campaignCountMonth}</p>
          </div>

          <div className="bg-white  p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg text-start font-semibold text-gray-800 ">
            จำนวนกองบุญ (ปีนี้)
            </h3>
            <p className="mt-2 text-4xl font-bold text-red-600 ">{campaignCountYear}</p>
          </div>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}
