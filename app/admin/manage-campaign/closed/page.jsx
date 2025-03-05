"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import TopicSelect from "@/components/TopicSelect";
import ReactDOM from "react-dom/client";
import { X } from "lucide-react";
import { useParams } from "next/navigation"
import ScrollToTop from "@/components/ScrollToTop";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function CampaignClosed() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ตรวจสอบสิทธิ์ (อนุญาตเฉพาะ Admin)
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "admin") {
      Swal.fire({
        title: "ปฏิเสธการเข้าถึง",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        icon: "error",
      }).then(() => router.push("/login"));
    }
  }, [session, status, router]);


  const fetchdata = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns/closed");
      const data = await res.json();
      setCampaigns(data);
      setLoading(false);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchdata()
  }, []);

  const handleEditCampaign = async (campaign) => {
    const { value: formValues } = await Swal.fire({
      title: "แก้ไขสถานะกองบุญ",
      html: `
      <div class="w-full max-w-lg mx-auto p-4">
          <!-- สถานะกองบุญ -->
          <div class="flex items-center gap-2 mb-4">
            <p class="w-1/3 text-lg text-start font-semibold">สถานะกองบุญ:</p>
            <select id="swal-status" class="w-2/3 p-2 border border-gray-300 rounded-lg">
              <option value="เปิดกองบุญ" ${campaign.status === "เปิดกองบุญ" ? "selected" : ""}>เปิดกองบุญ</option>
              <option value="รอเปิด" ${campaign.status === "รอเปิด" ? "selected" : ""}>รอเปิด</option>
              <option value="ปิดกองบุญแล้ว" ${campaign.status === "ปิดกองบุญแล้ว" ? "selected" : ""}>ปิดกองบุญแล้ว</option>
            </select>
          </div>
      `,
      showCancelButton: true,
      cancelButtonText: "ยกเลิก",
      focusConfirm: false,
      preConfirm: () => {
        return {  
          id: campaign.id,
          status: document.getElementById("swal-status").value.trim(), 
        };
      },
    });
  
    if (!formValues) return;
  
    try {
      const res = await fetch("/api/campaigns/closed", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // ✅ ใช้ JSON แทน FormData
        },
        body: JSON.stringify(formValues),
      });
  
      if (!res.ok) throw new Error("แก้ไขกองบุญไม่สำเร็จ");
      Swal.fire("สำเร็จ!", "แก้ไขข้อมูลกองบุญแล้ว", "success")
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
    }
  };

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

  const imgswl = async (img) => {
    await Swal.fire({
      html: `
        <div class="flex flex-col items-end">
          <div id="close-btn-container"></div>
          <div class="flex flex-col items-center">
            <img class="rounded-lg shadow-lg max-w-full" src="${img}" alt="img" />
          </div>
        </div>
      `,
      showConfirmButton: false, // 🔹 ซ่อนปุ่ม OK
      didOpen: () => {
        const closeBtnContainer = document.getElementById(
          "close-btn-container"
        );
        if (closeBtnContainer) {
          const root = ReactDOM.createRoot(closeBtnContainer);
          root.render(
            <X
              size={28}
              id="close-btn"
              className="cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={() => Swal.close()}
            />
          );
        }
      },
    });
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-100">
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900  text-center mb-6">
          กองบุญที่ปิดให้ร่วมบุญแล้ว
        </h1>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() =>
                (window.location.href = `/admin/manage-campaign`)
              }
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">กองบุญที่เปิดอยู่</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="overflow-auto rounded-lg shadow-lg">
            <table className="min-w-full border-collapse bg-white  rounded-lg">
              <thead className="bg-gray-200  text-gray-700 ">
                <tr>
                  <th className="p-4 w-[5%] text-center">#</th>
                  <th className="p-4 w-[10%] text-center">รูป</th>
                  <th className="p-4 text-left">ชื่อกองบุญ</th>
                  <th className="p-4 w-[10%] text-center">ราคา</th>
                  <th className="p-4 w-[10%] text-center">จำนวนที่เปิดรับ</th>
                  <th className="p-4 w-[10%] text-center">ยอดร่วมบุญ</th>
                  <th className="p-4 w-[15%] text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign, index) => (
                  <tr
                    key={campaign.id}
                    className="hover:bg-gray-100 transition"
                  >
                    <td className="p-4 text-center">{index + 1}</td>
                    <td className="p-4 text-center items-center">
                      <a
                        className="flex justify-center"
                        href="#"
                        onClick={() =>
                          imgswl(`${baseUrl}${campaign.campaign_img}`)
                        }
                      >
                        <img
                          className="w-12 h-12 object-cover rounded-md border border-gray-300 shadow-sm"
                          src={`${baseUrl}${campaign.campaign_img}`}
                          alt="campaign"
                        />
                      </a>
                    </td>
                    <td className="p-4">{campaign.name}</td>
                    <td className="p-4 text-center">
                      {campaign.price === 1 ? "ตามกำลังศรัทธา" : campaign.price}
                    </td>
                    <td className="p-4 text-center">
                      {campaign.price === 1 ? "ตามกำลังศรัทธา" : campaign.stock}
                    </td>
                    <td className="p-4 text-center">
                      {campaign.price === 1 ? campaign.total_value + " (บาท)" : campaign.total_value}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {campaign.price === 1 && (
                          <button
                            onClick={() =>
                              (window.location.href = `/admin/manage-campaign/campaign-detail-all/${campaign.id}`)
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            รายการร่วมบุญ
                          </button>
                        )}
                        {campaign.price > 1 && (
                          <button
                            onClick={() =>
                              (window.location.href = `/admin/manage-campaign/campaign-detail/${campaign.id}`)
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            รายการร่วมบุญ
                          </button>
                        )}
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}
