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
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function CampaignClosed() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);

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
    try {
      const res = await axios.get(`/api/campaigns/closed`);
      setCampaigns(res.data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    }
  };

  useEffect(() => {

    fetchdata();

    const intervalId = setInterval(fetchdata, 5000);

    return () => clearInterval(intervalId);
  }, []);

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
          <div className="hidden md:flex overflow-auto rounded-lg shadow-lg">
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
          <div className="md:hidden">
            {campaigns.map((campaign, index) => (
              <div key={campaign.id} className="mb-4 rounded-lg shadow-lg py-6 px-2 bg-sky-200 ">
                <div className=" flex flex-col ">
                  <div className="truncate-text text-nowrap">
                    <p>
                      กองบุญ{campaign.name}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 h-24 bg-white rounded-lg p-4 w-full items-center">
                    <p className="text-center">ราคา</p>
                    <p className="text-center">จำนวน</p>
                    <p className="text-center">ยอดร่วมบุญ</p>
                    <p className="text-center">{campaign.price === 1 ? "ตามกำลังศรัทธา" : campaign.price}</p>
                    <p className="text-center">{campaign.price === 1 ? "ตามกำลังศรัทธา" : campaign.stock}</p>
                    <p className="text-center">{campaign.price === 1 ? campaign.total_value + " (บาท)" : campaign.total_value}</p>
                  </div>
                </div>
                <div className="flex justify-center itm=em-center gap-2 mt-4">
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
              </div>
            ))}
          </div>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}
