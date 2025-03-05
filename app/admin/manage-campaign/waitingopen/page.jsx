"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Navbar from "../../../components/Navbar";
import TopicSelect from "../../../components/TopicSelect";
import ReactDOM from "react-dom/client";
import { X } from "lucide-react";
import { useParams } from "next/navigation"
import ScrollToTop from "../../../components/ScrollToTop";
import useSSE from "../../../hooks/useSSE";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function CampaignWaitingOpen() {
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

  // ✅ ดึงข้อมูลสมาชิก
  useSSE("/api/campaigns/waitingopen", (data) => {
    setCampaigns(data);
    setLoading(false);
  });

  // ✅ เพิ่มสมาชิกใหม่
  const handleAddUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มกองบุญใหม่",
      html: `
        <div class="w-full max-w-lg mx-auto p-4">
          <!-- สถานะกองบุญ -->
          <div class="flex items-center gap-2 mb-4">
            <p class="w-1/3 text-lg text-start font-semibold">สถานะกองบุญ:</p>
            <select id="swal-status" class="w-2/3 p-2 border border-gray-300 rounded-lg">
              <option value="เปิดกองบุญ">เปิดกองบุญ</option>
              <option value="รอเปิด">รอเปิด</option>
              <option value="ปิดกองบุญแล้ว">ปิดกองบุญแล้ว</option>
            </select>
          </div>
  
          <!-- ส่งให้ -->
          <div class="flex items-center gap-2 mb-4">
            <p class="w-1/3 text-lg text-start font-semibold">ส่งให้:</p>
            <select id="swal-Broadcast" class="w-2/3 p-2 border border-gray-300 rounded-lg">
              <option value="Broadcast">Broadcast ทั้งหมด</option>
              <option value="3months">ลูกบุญย้อนหลัง 3 เดือน</option>
              <option value="year">ลูกบุญย้อนหลัง 1 ปี</option>
              <option value="NOBroadcast">ไม่ส่งข้อความ</option>
            </select>
          </div>

          <div class="flex items-center gap-2 mb-4">
            <p class="w-1/3 text-lg text-start font-semibold">เลือกงาน:</p>
              <div class="w-2/3" id="topic-container"></div>
            </div>
  
          <!-- ประเภทข้อมูลที่ส่ง -->
          <div class="flex items-center gap-2 mb-4">
            <p class="w-1/3 text-lg text-start font-semibold">ข้อมูลที่ส่ง:</p>
            <select id="swal-details" class="w-2/3 p-2 border border-gray-300 rounded-lg">
              <option value="ชื่อสกุล">ชื่อสกุล</option>
              <option value="กล่องข้อความใหญ่">กล่องข้อความใหญ่</option>
              <option value="ชื่อวันเดือนปีเกิด">ชื่อวันเดือนปีเกิด</option>
              <option value="ตามศรัทธา">ตามศรัทธา</option>
              <option value="คำขอพร">คำขอพร</option>
            </select>
          </div>
  
          <!-- ตอบกลับ -->
          <div class="flex items-center gap-2 mb-4">
            <p class="w-1/3 text-lg text-start font-semibold">ตอบกลับ:</p>
            <select id="swal-respond" class="w-2/3 p-2 border border-gray-300 rounded-lg">
              <option value="แอดมินจะส่งภาพกองบุญให้ท่านได้อนุโมทนาอีกครั้ง">แอดมินจะส่งภาพกองบุญให้ท่านได้อนุโมทนาอีกครั้ง</option>
              <option value="ข้อมูลของท่านเข้าระบบเรียบร้อยแล้ว">ข้อมูลของท่านเข้าระบบเรียบร้อยแล้ว</option>
              <option value="ไม่ส่งข้อความ">ไม่ส่งข้อความ</option>
            </select>
          </div>
  
          <!-- ชื่อกองบุญ -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">ชื่อกองบุญ:</label>
            <textarea id="swal-name" rows="3" class="w-full p-2 border border-gray-300 rounded-lg" required></textarea>
          </div>
  
          <!-- รายละเอียด -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">รายละเอียด:</label>
            <textarea id="swal-description" rows="5" class="w-full p-2 border border-gray-300 rounded-lg" required></textarea>
          </div>
  
          <!-- ราคา & เปิดรับ -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-lg font-semibold mb-1">ราคา:</label>
              <input id="swal-price" type="number" min="1" class="w-full p-2 border border-gray-300 rounded-lg" value="1" required />
            </div>
            <div>
              <label class="block text-lg font-semibold mb-1">เปิดรับ:</label>
              <input id="swal-stock" type="number" min="1" class="w-full p-2 border border-gray-300 rounded-lg" value="1" required />
            </div>
          </div>
  
          <!-- อัปโหลดรูปภาพ -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-2">รูปกองบุญ:</label>
            <input class="w-full p-2 border border-gray-300 rounded-lg" type="file" id="swal-campaign_img" accept="image/*" required />
          </div>
        </div>
      `,
      didOpen: () => {
        const topicContainer = document.getElementById("topic-container");

        if (topicContainer) {
          const root = ReactDOM.createRoot(topicContainer);
          root.render(
            <TopicSelect
              onChange={(e) => console.log("Selected Topic:", e.target.value)}
            />
          );
        }
      },
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById("swal-name").value.trim();
        const description = document
          .getElementById("swal-description")
          .value.trim();
        const status = document.getElementById("swal-status").value;
        const topicId = document.getElementById("swal-topicId").value;
        const Broadcast = document.getElementById("swal-Broadcast").value;
        const details = document.getElementById("swal-details").value;
        const respond = document.getElementById("swal-respond").value;
        const price = document.getElementById("swal-price").value;
        const stock = document.getElementById("swal-stock").value;
        const campaign_img =
          document.getElementById("swal-campaign_img").files[0];

        if (
          !name ||
          !description ||
          !status ||
          !Broadcast ||
          !details ||
          !respond ||
          !campaign_img ||
          price < 1 ||
          stock < 1
        ) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง!");
          return false;
        }

        return {
          name,
          description,
          price,
          stock,
          status,
          Broadcast,
          details,
          respond,
          topicId,
          campaign_img,
        };
      },
    });

    if (!formValues) return;

    try {
      // ✅ ใช้ `FormData` แทน `JSON.stringify()` เพื่อรองรับการอัปโหลดไฟล์
      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("description", formValues.description);
      formData.append("price", formValues.price);
      formData.append("topicId", formValues.topicId);
      formData.append("stock", formValues.stock);
      formData.append("status", formValues.status);
      formData.append("Broadcast", formValues.Broadcast);
      formData.append("details", formValues.details);
      formData.append("respond", formValues.respond);
      formData.append("campaign_img", formValues.campaign_img);

      const res = await fetch("/api/campaigns", {
        method: "POST",
        body: formData, // ✅ ใช้ FormData เพื่อรองรับการอัปโหลดไฟล์
      });

      if (!res.ok) throw new Error("เพิ่มกองบุญไม่สำเร็จ");
      Swal.fire("สำเร็จ!", "เพิ่มกองบุญใหม่แล้ว", "success");
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
    }
  };

  // ✅ ลบสมาชิก
  const handleDeleteCampaign = async (id) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ต้องการลบกองบุญนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/campaigns", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) throw new Error("ลบกองบุญไม่สำเร็จ");
        Swal.fire("ลบสำเร็จ!", "กองบุญถูกลบแล้ว", "success");
      } catch (error) {
        Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
      }
    }
  };

  const handleOpenCampaign = async (campaign) => {
    const { value: formValues } = await Swal.fire({
      title: "แก้ไขข้อมูลสมาชิก",
      html: `
      <div class="w-full max-w-lg mx-auto p-4">
          <input id="swal-status" type="hidden" value="เปิดกองบุญ" />
  
          <div class="flex items-center gap-2 mb-4">
            <p class="w-1/3 text-lg text-start font-semibold">ส่งให้:</p>
            <select id="swal-Broadcast" class="w-2/3 p-2 border border-gray-300 rounded-lg">
              <option value="Broadcast">Broadcast ทั้งหมด</option>
              <option value="3months">ลูกบุญย้อนหลัง 3 เดือน</option>
              <option value="year">ลูกบุญย้อนหลัง 1 ปี</option>
              <option value="NOBroadcast">ไม่ส่งข้อความ</option>
            </select>
          </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      confirmButtonText: "เปิดกองบุญ",
      cancelButtonText: "ยกเลิก",
      focusConfirm: false,
      preConfirm: () => {
        return {  
          id: campaign.id,
          status: document.getElementById("swal-status").value.trim(),
          Broadcast: document.getElementById("swal-Broadcast").value.trim(),
        };
      },
    });
  
    if (!formValues) return;
  
    try {
      const res = await fetch("/api/campaigns/waitingopen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ ใช้ JSON แทน FormData
        },
        body: JSON.stringify(formValues),
      });
  
      if (!res.ok) throw new Error("เปิดกองบุญไม่สำเร็จ");
      Swal.fire("สำเร็จ!", "เปิดกองบุญแล้ว", "success");
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
    }
  };
  
  const handleEditCampaign = async (campaign) => {
    const { value: formValues } = await Swal.fire({
      title: "แก้ไขข้อมูลสมาชิก",
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
  
          <!-- ประเภทข้อมูลที่ส่ง -->
          <div class="flex items-center gap-2 mb-4">
            <p class="w-1/3 text-lg text-start font-semibold">ข้อมูลที่ส่ง:</p>
            <select id="swal-details" class="w-2/3 p-2 border border-gray-300 rounded-lg">
              <option value="ชื่อสกุล" ${campaign.details === "ชื่อสกุล" ? "selected" : ""}>ชื่อสกุล</option>
              <option value="กล่องข้อความใหญ่" ${campaign.details === "กล่องข้อความใหญ่" ? "selected" : ""}>กล่องข้อความใหญ่</option>
              <option value="ชื่อวันเดือนปีเกิด" ${campaign.details === "ชื่อวันเดือนปีเกิด" ? "selected" : ""}>ชื่อวันเดือนปีเกิด</option>
              <option value="ตามศรัทธา" ${campaign.details === "ตามศรัทธา" ? "selected" : ""}>ตามศรัทธา</option>
              <option value="คำขอพร" ${campaign.details === "คำขอพร" ? "selected" : ""}>คำขอพร</option>
            </select>
          </div>
  
          <!-- ตอบกลับ -->
          <div class="flex items-center gap-2 mb-4">
            <p class="w-1/3 text-lg text-start font-semibold">ตอบกลับ:</p>
            <select id="swal-respond" class="w-2/3 p-2 border border-gray-300 rounded-lg">
              <option value="แอดมินจะส่งภาพกองบุญให้ท่านได้อนุโมทนาอีกครั้ง" ${campaign.respond === "แอดมินจะส่งภาพกองบุญให้ท่านได้อนุโมทนาอีกครั้ง" ? "selected" : ""}>แอดมินจะส่งภาพกองบุญให้ท่านได้อนุโมทนาอีกครั้ง</option>
              <option value="ข้อมูลของท่านเข้าระบบเรียบร้อยแล้ว" ${campaign.respond === "ข้อมูลของท่านเข้าระบบเรียบร้อยแล้ว" ? "selected" : ""}>ข้อมูลของท่านเข้าระบบเรียบร้อยแล้ว</option>
              <option value="ไม่ส่งข้อความ" ${campaign.respond === "ไม่ส่งข้อความ" ? "selected" : ""}>ไม่ส่งข้อความ</option>
            </select>
          </div>
  
          <!-- ชื่อกองบุญ -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">ชื่อกองบุญ:</label>
            <textarea id="swal-name" rows="3" class="w-full p-2 border border-gray-300 rounded-lg" required>${campaign.name}</textarea>
          </div>
  
          <!-- รายละเอียด -->
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">รายละเอียด:</label>
            <textarea id="swal-description" rows="5" class="w-full p-2 border border-gray-300 rounded-lg" required>${campaign.description}</textarea>
          </div>
  
          <!-- ราคา & เปิดรับ -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-lg font-semibold mb-1">ราคา:</label>
              <input id="swal-price" type="number" min="1" class="w-full p-2 border border-gray-300 rounded-lg" value="${campaign.price}" required />
            </div>
            <div>
              <label class="block text-lg font-semibold mb-1">เปิดรับ:</label>
              <input id="swal-stock" type="number" min="1" class="w-full p-2 border border-gray-300 rounded-lg" value="${campaign.stock}" required />
            </div>
          </div>
      `,
      showCancelButton: true,
      cancelButtonText: "ยกเลิก",
      focusConfirm: false,
      preConfirm: () => {
        return {  
          id: campaign.id,
          status: document.getElementById("swal-status").value.trim(),
          details: document.getElementById("swal-details").value.trim(),
          respond: document.getElementById("swal-respond").value.trim(),
          name: document.getElementById("swal-name").value.trim(),
          description: document.getElementById("swal-description").value.trim(),
          price: Number(document.getElementById("swal-price").value.trim()) || 0,  
          stock: Number(document.getElementById("swal-stock").value.trim()) || 0,  
        };
      },
    });
  
    if (!formValues) return;
  
    try {
      const res = await fetch("/api/campaigns/waitingopen", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // ✅ ใช้ JSON แทน FormData
        },
        body: JSON.stringify(formValues),
      });
  
      if (!res.ok) throw new Error("แก้ไขกองบุญไม่สำเร็จ");
      Swal.fire("สำเร็จ!", "แก้ไขข้อมูลกองบุญแล้ว", "success");
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
    <div className="min-h-screen pt-16 bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
          จัดการข้อมูลกองบุญ
        </h1>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            + เพิ่มสมาชิก
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="overflow-auto rounded-lg shadow-lg">
            <table className="min-w-full border-collapse bg-white dark:bg-gray-800 rounded-lg">
              <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="p-4 w-[5%] text-center">#</th>
                  <th className="p-4 w-[10%] text-center">รูป</th>
                  <th className="p-4 text-left">ชื่อกองบุญ</th>
                  <th className="p-4 w-[10%] text-center">ราคา</th>
                  <th className="p-4 w-[10%] text-center">จำนวนที่เปิดรับ</th>
                  <th className="p-4 w-[10%] text-center">ยอดร่วมบุญ</th>
                  <th className="p-4 w-[30%] text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign, index) => (
                  <tr
                    key={campaign.id}
                    className="border-t hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <td className="p-4 text-center">{index + 1}</td>
                    <td className="p-4 text-center items-center">
                      <a
                        className="flex justify-center"
                        href="#"
                        onClick={() =>
                          imgswl(`${baseUrl}/${campaign.campaign_img}`)
                        }
                      >
                        <img
                          className="w-12 h-12 object-cover rounded-md border border-gray-300 shadow-sm"
                          src={`${baseUrl}/${campaign.campaign_img}`}
                          alt="campaign"
                        />
                      </a>
                    </td>
                    <td className="p-4">{campaign.name}</td>
                    <td className="p-4 text-center">{campaign.price}</td>
                    <td className="p-4 text-center">{campaign.stock}</td>
                    <td className="p-4 text-center">{campaign.total_value}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/admin/manage-campaign/campaign-detail/${campaign.id}`)
                          }
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          รายการร่วมบุญ
                        </button>
                        <button
                          onClick={() => handleOpenCampaign(campaign)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                          เปิดกองบุญ
                        </button>
                        <button
                          onClick={() => handleEditCampaign(campaign)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          ลบ
                        </button>
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
