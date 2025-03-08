"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import ReactDOM from "react-dom/client";
import { X } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [campaignCountMonth, setcampaignCountMonth] = useState(true);
  const [campaignCountYear, setcampaignCountYear] = useState(true);
  const [total_value_year, settotal_value_year] = useState(true);
  const [total_value_month, settotal_value_month] = useState(true);
  const [Campaigns, setCampaigns] = useState([]);
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

  const fetchdata = async () => {
    try {
      const res = await fetch("/api/dashboard/campaigns");
      const data = await res.json();
      setCampaigns(data);
      setLoading(false);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
    }
    setLoading(false);
  };

  useEffect(() => {

    fetchdata();

    const intervalId = setInterval(fetchdata, 5000);

    return () => clearInterval(intervalId);
  }, []);

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
            <p className="mt-2 text-4xl font-bold text-green-600 ">{Number(total_value_month).toLocaleString("th-TH")}</p>
          </div>

          <div className="bg-white  p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg text-start font-semibold text-gray-800 ">
              ยอดรวมรายรับ (ปีนี้)
            </h3>
            <p className="mt-2 text-4xl font-bold text-green-600 ">{Number(total_value_year).toLocaleString("th-TH")}</p>
          </div>

          <div className="bg-white hidden sm:block  p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg text-start font-semibold text-gray-800 ">
              จำนวนกองบุญ (เดือนนี้)
            </h3>
            <p className="mt-2 text-4xl font-bold text-red-600 ">{campaignCountMonth}</p>
          </div>

          <div className="bg-white hidden sm:block  p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg text-start font-semibold text-gray-800 ">
              จำนวนกองบุญ (ปีนี้)
            </h3>
            <p className="mt-2 text-4xl font-bold text-red-600 ">{campaignCountYear}</p>
          </div>
        </div>

        <div>
          <h1 className="mt-10 mb-5 text-xl">กองบุญที่ยังเปิดให้ร่วมบุญ</h1>
          <div className="hidden md:flex overflow-x-auto mt-2">
            <div className="overflow-auto rounded-lg shadow-xl">
              <table className="w-full table-fixed border-collapse bg-white rounded-lg">
                <thead className="bg-gray-200  text-gray-700 ">
                  <tr>
                    <th className="p-4 w-[5%] text-center">#</th>
                    <th className="p-4 w-[10%] text-center">รูป</th>
                    <th className="p-4 text-left">ชื่อกองบุญ</th>
                    <th className="p-4 w-[10%] text-center">ราคา</th>
                    <th className="p-4 w-[10%] text-center">จำนวนที่เปิดรับ</th>
                    <th className="p-4 w-[10%] text-center">ยอดร่วมบุญ</th>
                    <th className="p-4 w-[15%] text-center">คงเหลือร่วมบุญได้</th>
                  </tr>
                </thead>
                <tbody>
                  {Campaigns.map((campaign, index) => (
                    <tr
                      key={campaign.id}
                      className="hover:bg-gray-100 transition rounded-lg"
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
                      <td className="p-4 truncate-text">
                        {campaign.price === 1 && (
                          <a className="text-blue-600 text-lg" href={`/admin/manage-campaign/campaign-detail-all/${campaign.id}`}>{campaign.name}</a>
                        )}
                        {campaign.price > 1 && (
                          <a className="text-blue-600 text-lg" href={`/admin/manage-campaign/campaign-detail/${campaign.id}`}>{campaign.name}</a>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {campaign.price === 1 ? "ตามกำลังศรัทธา" : campaign.price}
                      </td>
                      <td className="p-4 text-center">
                        {campaign.price === 1 ? "ตามกำลังศรัทธา" : campaign.stock}
                      </td>
                      <td className="p-4 text-center">
                        {campaign.price === 1 ? campaign.total_donated + " (บาท)" : campaign.total_donated}
                      </td>
                      <td className="p-4 text-center">
                        {campaign.remaining_stock === 999999 ? "ตามกำลังศรัทธา" : campaign.remaining_stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {Campaigns.map((campaign, index) => (
            <div key={campaign.id} className="flex md:hidden px-2 py-4 bg-sky-200 shadow-md rounded-lg mb-2">
              <div className="grid grid-cols-1 w-full">
                <div className="w-full">
                  <p className="truncate-text text-nowrap">กองบุญ {campaign.name}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 h-24 bg-white rounded-lg p-4 w-full items-center">
                  {/* <p className="text-center">ราคา</p> */}
                  <p className="text-center">ร่วมบุญแล้ว</p>
                  <p className="text-center">คงเหลือ</p>
                  {/* <p className="text-center">{campaign.price === 1 ? "ตามกำลังศรัทธา" : campaign.price}</p> */}
                  <p className="text-center">{campaign.price === 1 ? campaign.total_donated + " (บาท)" : campaign.total_donated}</p>
                  <p className="text-center">{campaign.remaining_stock === 999999 ? "ตามกำลังศรัทธา" : campaign.remaining_stock}</p>
                </div>
                <div className="text-center mt-4">
                  {campaign.price === 1 && (
                    <a className="bg-blue-500 text-white py-2 px-4 rounded-lg" href={`/admin/manage-campaign/campaign-detail-all/${campaign.id}`}>รายการร่วมบุญ</a>
                  )}
                  {campaign.price > 1 && (
                    <a className="bg-blue-500 text-white py-2 px-4 rounded-lg" href={`/admin/manage-campaign/campaign-detail/${campaign.id}`}>รายการร่วมบุญ</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}
