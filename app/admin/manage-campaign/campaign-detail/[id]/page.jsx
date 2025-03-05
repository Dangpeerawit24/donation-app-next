"use client";

import { useEffect, useState, Fragment } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import TopicSelect from "@/components/TopicSelect";
import ReactDOM from "react-dom/client";
import { X } from "lucide-react";
import { useParams } from "next/navigation"
import ScrollToTop from "@/components/ScrollToTop";
import Image from "next/image";
import * as XLSX from "xlsx";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function CampaignDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [namecampaign, setnamecampaign] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [timestamp, setTimestamp] = useState(Date.now());

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
      const res = await fetch(`/api/campaign-transactions?id=${id}`);
      const data = await res.json();
      setCampaigns(data);
      setLoading(false);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchdata()
  }, []);

  const fetachName = async (id) => {
    const res = await fetch(`/api/campaign-transactions/name?id=${id}`);
    const data = await res.json();
    setnamecampaign(data);
  };

  useEffect(() => {
    fetachName(id);
  }, [id]);

  if (typeof window !== "undefined") {
    window.addCommas = function () {
      const textarea = document.getElementById("swal-details");
      const value = document.getElementById("swal-value");
      if (!textarea || !value) return;

      const lines = textarea.value.split("\n");

      const updatedLines = lines.map((line, index) => {
        return line.trim() !== "" && index < lines.length - 1
          ? `${line}/n/`
          : line;
      });

      textarea.value = updatedLines.join("\n");

      value.value = lines.length;
    };
  }

  if (typeof window !== "undefined") {
    window.addCommasWish = function () {
      const textarea = document.getElementById("swal-detailswish");
      const value = document.getElementById("swal-value");
      if (!textarea || !value) return;

      const lines = textarea.value.split("\n");

      const updatedLines = lines.map((line, index) => {
        return line.trim() !== "" && index < lines.length - 1
          ? `${line}/n/`
          : line;
      });

      textarea.value = updatedLines.join("\n");

      value.value = lines.length;
    };
  }


  // ✅ เพิ่มสมาชิกใหม่
  const handleAddUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มรายการร่วมบุญ",
      html: `
        <div class="w-full max-w-lg mx-auto p-4">

          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">รายนาม:</label>
            <textarea id="swal-details" rows="5" class="w-full p-2 border border-gray-300 rounded-lg" required></textarea>
          <button class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onclick="addCommas()">แยกรายการ</button>
            </div>
          
  
          <div class="mb-4">
            <label class="block text-lg font-semibold mb-1">คำขอพร:</label>
            <textarea id="swal-detailswish" rows="5" class="w-full p-2 border border-gray-300 rounded-lg"></textarea>
            <button class="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onclick="addCommasWish()">แยกรายการ</button>
          </div>

          <div class="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label class="block text-lg font-semibold mb-1">จำนวน:</label>
              <input id="swal-value" type="number" min="1" class="w-full p-2 border border-gray-300 rounded-lg" value="1" required />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-lg font-semibold mb-1">ชื่อไลน์:</label>
              <input id="swal-lineName" type="text" class="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label class="block text-lg font-semibold mb-1">ที่มา:</label>
              <select id="swal-form" class="w-full p-2 border border-gray-300 rounded-lg">
                <option value="L">L</option>
                <option value="IB">IB</option>
                <option value="P">P</option>
              </select> 
            </div>
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
        const details = document.getElementById("swal-details").value;
        const detailswish = document.getElementById("swal-detailswish").value;
        const value = document.getElementById("swal-value").value;
        const lineName = document.getElementById("swal-lineName").value;
        const form = document.getElementById("swal-form").value;

        if (
          !details ||
          !value ||
          !lineName ||
          !form
        ) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง!");
          return false;
        }

        return {
          details,
          detailswish,
          value,
          lineName,
          form,
        };
      },
    });

    if (!formValues) return;

    try {
      // ✅ ใช้ `FormData` แทน `JSON.stringify()` เพื่อรองรับการอัปโหลดไฟล์
      const formData = new FormData();
      formData.append("details", formValues.details);
      formData.append("detailswish", formValues.detailswish);
      formData.append("value", formValues.value);
      formData.append("lineName", formValues.lineName);
      formData.append("form", formValues.form);
      formData.append("campaignsid", namecampaign.id);
      formData.append("campaignsname", namecampaign.name);
      formData.append("respond", namecampaign.respond);

      const res = await fetch("/api/campaign-transactions", {
        method: "POST",
        body: formData, // ✅ ใช้ FormData เพื่อรองรับการอัปโหลดไฟล์
      });

      if (!res.ok) throw new Error("เพิ่มรายการร่วมบุญไม่สำเร็จ");
      Swal.fire("สำเร็จ!", "เพิ่มรายการร่วมบุญใหม่แล้ว", "success");
      fetchdata();
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
    }
  };

  // ✅ ลบสมาชิก
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ต้องการลบข้อมูลนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/campaign-transactions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) throw new Error("ลบข้อมูลไม่สำเร็จ");
        Swal.fire("ลบสำเร็จ!", "ข้อมูลถูกลบแล้ว", "success");
        fetchdata();
      } catch (error) {
        Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
      }
    }
  };

  const copyTable = () => {
    const table = document.getElementById("myTable");
    if (!table) return;

    const columnsToCopy = [0, 1, 2, 3, 4, 5, 6, 7];

    let textToCopy = "";
    const rows = table.querySelectorAll("tr");
    rows.forEach((row) => {
      const cells = row.querySelectorAll("th, td");
      const rowData = [];

      columnsToCopy.forEach((colIndex) => {
        const cell = cells[colIndex];
        const cellText = cell
          ? cell.innerText.replace(/\r?\n|\r/g, " ")
          : "";
        rowData.push(cellText);
      });

      textToCopy += rowData.join("\t") + "\n";
    });

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        Swal.fire({
          title: "คัดลอกไปยัง Clipboard แล้ว!",
          icon: "success",
          confirmButtonText: "ตกลง"
        });
      })
      .catch((err) => {
        Swal.fire({
          title: "คัดลอกไม่สำเร็จ",
          text: err.message,
          icon: "error",
          confirmButtonText: "ตกลง"
        });
      });
  };


  const exportToExcel = () => {
    const table = document.getElementById("myTable");
    if (!table) return;

    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });

    XLSX.writeFile(wb, "myTableData.xlsx");
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
        <h1 className="text-2xl font-bold text-gray-900  text-center">
          จัดการข้อมูลกองบุญ
        </h1>
        <h2 className="text-xl font-bold text-gray-900  text-center mb-6">#{namecampaign.name}</h2>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button onClick={copyTable} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">คัดลอกข้อมูลในตาราง</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">บันทึกเป็น Excel</button>
            <button 
              onClick={() =>
                (window.location.href = `/admin/manage-campaign/campaign-detail-succeed/${namecampaign.id}`)
              } 
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">รายการที่ดำเนินการแล้ว</button>
          </div>
          <div>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + เพิ่มรายการร่วมบุญ
            </button>
          </div>
        </div>

        <div className="overflow-x-auto table-container table-fixed">
          <div className="overflow-auto rounded-lg shadow-lg">
            <table id="myTable" className="w-full table-fixed border-collapse bg-white rounded-lg">
              <thead className="bg-gray-200  text-gray-700 ">
                <tr>
                  <th className="p-4 w-[2%] text-center">#</th>
                  <th className="p-4 w-[5%] text-center">สลิป</th>
                  <th className="p-4 text-start">ข้อมูลผู้ร่วมบุญ</th>
                  <th className="p-4 text-start">คำขอพร</th>
                  <th className="p-4 w-[5%] text-center">จำนวน</th>
                  <th className="p-4 w-[10%] text-center">ชื่อไลน์</th>
                  <th className="p-4 w-[10%] text-center">QR Url</th>
                  <th className="p-4 w-[5%] text-center">ที่มา</th>
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
                          imgswl(`${baseUrl}${campaign.slip}`)
                        }
                      >
                        <Image
                          className="w-12 h-12 object-cover rounded-md border border-gray-300 shadow-sm"
                          src={`${baseUrl}${campaign.slip}`}
                          alt="campaign"
                          width={48}
                          height={48}
                        />
                      </a>
                    </td>
                    <td className="p-4 text-nowrap truncate-text">
                      {campaign.detailsname !== null && campaign.detailsbirthdate == null ? campaign.detailsname : ""}
                      {campaign.detailsname !== null && campaign.detailswish !== null ? campaign.detailsname : ""}
                      {campaign.detailsbirthdate !== null ? (
                        <>
                          {campaign.detailsname}
                          <br />
                          {campaign.detailsbirthdate}{" "}
                          {campaign.detailsbirthmonth}{" "}
                          {campaign.detailsbirthyear}{" เวลา "}
                          {campaign.detailsbirthtime}{" ปี"}
                          {campaign.detailsbirthconstellation}{" อายุ "}
                          {campaign.detailsbirthage}{" ปี"}
                        </>
                      ) : ""}
                      {campaign.detailstext !== null ? campaign.detailstext : ""}
                      {campaign.details !== null ? campaign.details : ""}
                    </td>
                    <td className="p-4 text-nowrap tuncate-text">
                      {campaign.detailswish !== null ? campaign.detailswish : ""}
                    </td>
                    <td className="p-4 text-center text-nowrap truncate-text">{campaign.value}</td>
                    <td className="p-4 text-center text-nowrap truncate-text">{campaign.lineName}</td>
                    <td className="p-4 text-center text-nowrap truncate-text">{campaign.qr_url}</td>
                    <td className="p-4 text-center text-nowrap truncate-text">{campaign.form}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/line/pushimages/${campaign.transactionID}`)
                          }
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          ส่งรูป
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
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
