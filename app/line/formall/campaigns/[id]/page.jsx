"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import { getCookie } from "cookies-next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function FormPage() {
  const router = useRouter();
  const { id } = useParams();
  // ตั้งค่า step เป็น 5 ขั้นตอน
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [paymentFile, setPaymentFile] = useState(null);
  // ข้อมูลผู้ร่วมบุญ (ชุดเดียว)
  const [entry, setEntry] = useState({
    name: "",
    birthdate: "",
    month: "",
    year: "",
    age: "",
    birthtime: "",
    constellation: "",
    detailstext: "",
    detailswish: "",
    donationQuantity: "",
    useGoodTime: false,
  });
  // จำนวนเงินที่ต้องการบริจาค
  const [donationQuantity, setDonationQuantity] = useState(1);
  // state สำหรับ suggestion
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    const userProfile = getCookie("profile");
    if (!userProfile) {
      router.push("/line/index");
      return;
    }
    setProfile(JSON.parse(userProfile));
  }, [router]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/line/get-campaigns?id=${id}`);
      const data = await response.json();
      if (data) {
        setCampaigns(data);
      } else {
        console.error("Error fetching campaigns:", data.message);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [id]);

  // อัปเดตข้อมูลใน entry (สำหรับ Step 3)
  const handleEntryChange = (field, value) => {
    setEntry((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "name") {
      setActiveField("name");
      fetchUserData(value);
    }
  };

  const fetchUserData = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const response = await fetch(
        `/api/line/get-user?name=${query}&userid=${profile.userId}`
      );
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.users);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSelectSuggestion = (user) => {
    setEntry({
      name: user.detailsname || "",
      birthdate: user.detailsbirthdate || "",
      month: user.detailsbirthmonth || "",
      year: user.detailsbirthyear || "",
      age: user.detailsbirthage || "",
      birthtime: user.detailsbirthtime || "",
      constellation: user.detailsbirthconstellation || "",
      detailstext: "",
      detailswish: "",
      useGoodTime: user.detailsbirthtime === "เวลาดี",
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // จัดการเวลาเกิด
  const handleBirthTimeChange = (e) => {
    const { name, value } = e.target;
    setEntry((prev) => {
      const [currentHour = "00", currentMinute = "00"] = (prev.birthtime || "00:00").split(":");
      return {
        ...prev,
        birthtime: name === "hour" ? `${value}:${currentMinute}` : `${currentHour}:${value}`,
      };
    });
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setEntry((prev) => ({
      ...prev,
      useGoodTime: isChecked,
      birthtime: isChecked ? "เวลาดี" : "",
    }));
  };

  const handleAgeChange = (e) => {
    setEntry((prev) => ({
      ...prev,
      age: e.target.value,
    }));
  };

  // Step 2: ตรวจสอบจำนวนเงินบริจาค (Donation) แล้วไปขั้นตอนถัดไป
  const handleDonationNext = () => {
    if (!donationQuantity || donationQuantity < 1) {
      Swal.fire({
        title: "<h1 style='font-weight: bold; font-size: 22px; color: #444;'>กรุณากรอกจำนวนเงินที่ถูกต้อง</h1>",
        icon: "warning",
        confirmButtonText: "ตกลง",
        width: "375px",
      });
      return;
    }
    nextStep();
  };

  // Step 3: ตรวจสอบฟอร์มผู้ร่วมบุญแล้วแสดง Swal ยืนยันข้อมูล (เงื่อนไขเหมือนเดิม)
  const handleDetailsNext = () => {
    let missingFields = [];
    if (campaigns.detailsname === "true" && !entry.name)
      missingFields.push("• ชื่อ - นามสกุล");
    if (campaigns.detailsbirthdate === "true" && !entry.birthdate)
      missingFields.push("• วันเกิด");
    if (campaigns.detailsbirthdate === "true" && !entry.month)
      missingFields.push("• เดือนเกิด");
    if (campaigns.detailsbirthdate === "true" && !entry.year)
      missingFields.push("• ปีเกิด");
    if (campaigns.detailsbirthdate === "true" && !entry.constellation)
      missingFields.push("• ปีนักษัตร");
    if (campaigns.detailsbirthdate === "true" && !entry.birthtime)
      missingFields.push("• เวลาเกิด");
    if (campaigns.detailsbirthdate === "true" && !entry.age)
      missingFields.push("• อายุ");
    if (campaigns.detailstext === "true" && !entry.detailstext)
      missingFields.push("• รายนาม");
    if (campaigns.detailswish === "true" && !entry.detailswish)
      missingFields.push("• คำอธิษฐาน");

    if (missingFields.length > 0) {
      const missingListHTML = missingFields.map((field) => `<li>${field}</li>`).join("");
      Swal.fire({
        title: "<h1 style='font-weight: bold; font-size: 22px; color: #444;'>กรุณากรอกข้อมูลให้ครบถ้วน</h1>",
        html: `<ul style="text-align: left; font-size: 16px; color: #555;">${missingListHTML}</ul>`,
        icon: "warning",
        customClass: {
          popup: "rounded-lg shadow-lg",
          confirmButton: "bg-[#742F1E] text-white text-lg px-6 py-2 rounded-md",
        },
        confirmButtonText: "ตกลง",
        width: "375px",
      });
      return;
    } else {
      let confirmationHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
          <img src="/img/Asset 279.png" style="width: 100%; margin-top: 30px; background: transparent;">
        </div>
        <table style="width: 100%; text-align: left; font-size: 16px; color: #555;">`;
      if (campaigns.detailsname === "true") {
        confirmationHTML += `<tr><td><strong>ชื่อ-สกุล</strong></td><td>: ${entry.name}</td></tr>`;
      }
      if (campaigns.detailsbirthdate === "true") {
        confirmationHTML += `<tr><td><strong>วันเกิด</strong></td><td>: ${entry.birthdate}</td></tr>`;
        confirmationHTML += `<tr><td><strong>เดือนเกิด</strong></td><td>: ${entry.month}</td></tr>`;
        confirmationHTML += `<tr><td><strong>ปีเกิด</strong></td><td>: ${entry.year}</td></tr>`;
        confirmationHTML += `<tr><td><strong>ปีนักษัตร</strong></td><td>: ${entry.constellation}</td></tr>`;
        confirmationHTML += `<tr><td><strong>เวลาเกิด</strong></td><td>: ${entry.birthtime}</td></tr>`;
        confirmationHTML += `<tr><td><strong>อายุ</strong></td><td>: ${entry.age}</td></tr>`;
      }
      if (campaigns.detailstext === "true") {
        confirmationHTML += `<tr><td><strong>รายนาม</strong></td><td>: ${entry.detailstext}</td></tr>`;
      }
      // if (campaigns.detailswish === "true") {
      //   confirmationHTML += `<tr><td><strong>คำอธิษฐาน</strong></td><td>: ${entry.detailswish}</td></tr>`;
      // }
      // รวมจำนวนเงินที่บริจาคใน confirmation
      confirmationHTML += `<tr><td><strong>จำนวนเงินบริจาค</strong></td><td>: ${donationQuantity} บาท</td></tr>`;
      confirmationHTML += `</table>`;

      Swal.fire({
        title: "<h2 style='font-size: 24px; color: #B3885B;'>ตรวจสอบข้อมูลให้ถูกต้อง<br>ก่อนทำการยืนยัน</h2>",
        html: confirmationHTML,
        iconHtml: `<img src="/img/Asset 237.png" style="width: 100%; background: transparent;">`,
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "แก้ไข",
        customClass: {
          popup: "rounded-lg shadow-lg",
          confirmButton: "order-2 bg-[#742F1E] text-white text-lg px-6 py-2 mr-4 rounded-md",
          cancelButton: "order-1 bg-gray-400 text-white text-lg px-6 py-2 ml-4 rounded-md",
          icon: "no-border",
        },
        buttonsStyling: true,
        reverseButtons: true,
        width: "375px",
      }).then((result) => {
        if (result.isConfirmed) {
          nextStep();
        }
      });
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  useEffect(() => {
    if (step === 5) {
      const timer = setTimeout(() => {
        window.location.href = "/line/index";
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Step 4: อัปโหลดไฟล์สลิป
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setPaymentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!paymentFile || paymentFile.size === 0) {
      Swal.fire({
        text: "กรุณาอัปโหลดภาพสลิปก่อนดำเนินการ",
        icon: "warning",
        width: "375px",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
      });
      setLoading(false);
      return;
    }
    try {
      Swal.fire({
        title: "กำลังดำเนินการ...",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        width: "375px",
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const formDataToSend = new FormData();
      if (campaigns.detailsname === "true") {
        formDataToSend.append("name", entry.name);
      }
      if (campaigns.detailsbirthdate === "true") {
        formDataToSend.append("birthdate", entry.birthdate);
        formDataToSend.append("month", entry.month);
        formDataToSend.append("year", entry.year);
        formDataToSend.append("constellation", entry.constellation);
        formDataToSend.append("birthtime", entry.birthtime);
        formDataToSend.append("age", entry.age);
      }
      if (campaigns.detailstext === "true") {
        formDataToSend.append("detailstext", entry.detailstext);
      }
      if (campaigns.detailswish === "true") {
        formDataToSend.append("detailswish", entry.detailswish);
      }
      // ส่งจำนวนเงินบริจาคไปด้วย
      formDataToSend.append("donationQuantity", donationQuantity);
      formDataToSend.append("respond", campaigns.respond);
      formDataToSend.append("campaignsid", campaigns.id);
      formDataToSend.append("campaignsname", campaigns.name);
      formDataToSend.append("lineId", profile.userId);
      formDataToSend.append("lineName", profile.displayName);
      formDataToSend.append("file", paymentFile);

      const response = await fetch("/api/line/appsubmit-form", {
        method: "POST",
        body: formDataToSend,
      });
      if (!response.ok) {
        throw new Error("การส่งข้อมูลไม่สำเร็จ");
      }
      Swal.close();
      nextStep();
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด ❌",
        text: error.message || "เกิดปัญหาในการส่งข้อมูล กรุณาลองใหม่",
        icon: "error",
        width: "375px",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoading(false);
    }
  };

  // คำนวณยอดรวม: ยอดรวม = campaigns.price * donationQuantity
  const price = campaigns.price * donationQuantity;

  return (
    <div
      className="w-screen min-w-[375px] max-w-[425px] min-h-[60vh] p-0 m-0 flex flex-col bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url('/img/Background.png')" }}
    >
      {/* Progress Indicator: 5 ขั้นตอน */}
      <div className="grid grid-cols-1 py-6 px-4">
        <div className="relative mt-6 flex w-full justify-between xs:mt-10">
          {[
            "ข้อมูลกองบุญ",
            "จำนวนเงิน",
            "กรอกข้อมูล",
            "ชำระเงิน",
            "สำเร็จ",
          ].map((label, index) => (
            <div key={index} className="relative mt-4 flex flex-col items-center w-full z-20">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${index + 1 <= step ? "bg-green-600 scale-110 text-white" : "bg-gray-300"
                  }`}
              >
                {index + 1}
              </div>
              <p className={`text-xs mt-2 font-medium ${index + 1 <= step ? " text-white" : "text-gray-400"}`}>
                {label}
              </p>
            </div>
          ))}
        </div>
        <div className="relative w-full flex items-center justify-between mt-4">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300"></div>
          <div
            className="absolute bottom-0 left-0 h-1 bg-green-600 transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="w-full items-center px-6">
        {/* Step 1: ข้อมูลกองบุญ */}
        {step === 1 && (
          <div className="w-full min-h-[60vh]">
            <h2 className="w-full text-xl font-bold text-center mt-12 xs:mt-16">ร่วมบุญกองบุญ</h2>
            <>{profile?.detailsname}</>
            <h2 className="text-lg font-bold text-center text-wrap">{campaigns.name}</h2>
            {campaigns.campaign_img ? (
            <div className="flex w-full justify-center">
              <Image className="rounded-lg mt-4 w-full" src={campaigns.campaign_img} width={1920} height={1080} priority alt="Campaign" />
            </div>
            ) : null}
            <p className="mt-4 text-center text-lg">ร่วมบุญ: {campaigns.price === 1 ? "ตามกำลังศรัทธา" : `${campaigns.price} บาท`}</p>
            {campaigns.price !== 1 && (
              <p className="text-center text-md">รับเจ้าภาพจำนวน {campaigns.stock} กองบุญ</p>
            )}
            <Image className="mt-4 w-full" src="/img/Asset 279.png" width={500} height={500} alt="Campaign" />
            <p className="mt-4 text-gray-600 text-center">
              {campaigns.description}
            </p>
            <button onClick={nextStep} className="w-full flex items-center justify-center gap-2 mt-10 py-3 px-6 bg-[#742F1E] font-semibold text-white rounded-full shadow-md">
              ถัดไป <span className="text-xl">►</span>
            </button>
          </div>
        )}

        {/* Step 2: จำนวนเงินที่ต้องการบริจาค */}
        {step === 2 && (
          <div className="w-full min-h-[60vh]">
            <h2 className="w-full text-xl font-bold text-center mt-12 xs:mt-16">
              กรอกจำนวนเงินที่ต้องการบริจาค
            </h2>
            <div className="mt-10">
              <label className="block">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                min="1"
                value={donationQuantity}
                onChange={(e) => setDonationQuantity(parseInt(e.target.value))}
                className="w-full border p-2 rounded-lg mt-2"
              />
              <button
                onClick={handleDonationNext}
                className="w-full flex items-center justify-center gap-2 mt-10 py-3 px-6 bg-[#742F1E] font-semibold text-white rounded-full shadow-md"
              >
                ถัดไป <span className="text-xl">►</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: กรอกข้อมูลผู้ร่วมบุญ */}
        {step === 3 && (
          <div className="w-full min-h-[60vh]">
            <h2 className="w-full text-xl font-bold text-center mt-12 xs:mt-16">
              กรอกข้อมูลผู้ร่วมบุญ
            </h2>
            {campaigns.detailsname === "true" && (
              <>
                <div className="flex flex-row mt-4">
                  <label className="block mt-4">ชื่อ - นามสกุล</label>
                  <label className="block mt-4 text-red-600 font-bold">*</label>
                </div>
                <div className="relative w-full">
                  <input
                    type="text"
                    name="name"
                    value={entry.name}
                    onChange={(e) => handleEntryChange("name", e.target.value)}
                    className="w-full border p-2 rounded-lg mt-2"
                    placeholder="กรอกชื่อ - นามสกุล"
                    required
                    onFocus={() => setActiveField("name")}
                  />
                  {showSuggestions &&
                    activeField === "name" &&
                    suggestions.length > 0 && (
                      <ul className="absolute left-0 right-0 bg-white border rounded-lg shadow-md max-h-48 overflow-auto">
                        {suggestions.map((user, index) => (
                          <li
                            key={index}
                            onClick={() => handleSelectSuggestion(user)}
                            className="p-2 cursor-pointer hover:bg-gray-200"
                          >
                            {user.detailsname}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </>
            )}
            {campaigns.detailstext === "true" && (
              <>
                <div className="flex flex-row">
                  <label className="block mt-4">กรอกรายนามผู้ร่วมบุญ</label>
                  <label className="block mt-4 text-red-600 font-bold">*</label>
                </div>
                <div className="relative w-full">
                  <textarea
                    name="detailstext"
                    onChange={(e) => handleEntryChange("detailstext", e.target.value)}
                    className="w-full border p-2 rounded-lg mt-2"
                    placeholder="กรอกรายนามผู้ร่วมบุญ"
                    rows={10}
                    required
                    onFocus={() => setActiveField("detailstext")}
                  ></textarea>
                </div>
              </>
            )}
            {campaigns.detailswish === "true" && (
              <>
                <div className="flex flex-row">
                  <label className="block mt-4">กรอกคำอธิษฐาน</label>
                  <label className="block mt-4 text-red-600 font-bold">*</label>
                </div>
                <div className="relative w-full">
                  <textarea
                    name="detailswish"
                    onChange={(e) => handleEntryChange("detailswish", e.target.value)}
                    className="w-full border p-2 rounded-lg mt-2"
                    placeholder="กรอกคำอธิษฐาน"
                    rows={6}
                    required
                    onFocus={() => setActiveField("detailswish")}
                  ></textarea>
                </div>
              </>
            )}
            <div className="flex justify-end mt-10">
              <button
                onClick={handleDetailsNext}
                className="flex items-center justify-center gap-2 py-3 px-6 bg-[#742F1E] text-white text-lg font-semibold rounded-full shadow-md"
              >
                ถัดไป <span className="text-xl">►</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: ชำระเงิน (อัปโหลดสลิป) */}
        {step === 4 && (
          <div className="w-full min-h-[60vh]">
            <h2 className="text-xl font-bold text-[#BD9B5B] text-center mt-14 xs:mt-16">
              สแกน QR CODE นี้ เพื่อชำระเงิน
            </h2>
            <p className="text-center text-gray-500">บันทึกหน้าจอหรือบันทึกรูปภาพเพื่อสแกน</p>
            <Image className="mt-2 w-full" src="/img/Asset 279.png" width={500} height={500} alt="QRCODE" />
            <div className="flex-col justify-center mt-2">
              <div className="flex justify-center mt-2">
                <Image className="rounded-lg" src="/img/QRCODE.jpg" width={280} height={384} alt="QRCODE" />
              </div>
              <div className="flex flex-row justify-center mt-4">
                <p className="text-xl text-end mr-2">ยอดรวมสุทธิ</p>
                <p className="px-2 text-xl text-center bg-red-200 rounded-xl">{price}</p>
                <p className="text-xl text-start ml-2">บาท</p>
              </div>
              <Image className="mt-4 w-full" src="/img/Asset 279.png" width={500} height={500} alt="QRCODE" />
              <div className="mt-2 text-center">
                <h2 className="text-xl font-bold text-[#BD9B5B] text-center">
                  แนบสลิปหลักฐานการชำระเงิน
                </h2>
                <p className="text-xs">
                  * กรุณาอัปโหลดภาพสลิปที่เห็นชื่อและ QR Code ชัดเจน
                </p>
                <div className="mt-6 px-4 flex justify-center flex-row">
                  <label className="cursor-pointer bg-gray-400 text-white py-3 truncate-text px-6 rounded-full w-full max-w-xs text-center text-lg font-semibold hover:bg-gray-500 transition-all duration-300">
                    {paymentFile ? paymentFile.name : "อัปโหลดรูปภาพสลิป"}
                    <input
                      type="file"
                      name="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                      required
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-10 gap-4">
              <button
                onClick={prevStep}
                className="flex items-center justify-center gap-2 py-3 px-6 bg-[#B8A7A7] text-white text-lg font-semibold rounded-full shadow-md"
              >
                <span className="text-xl">◄</span> กลับ
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center justify-center gap-2 py-3 px-6 text-white text-lg font-semibold rounded-full shadow-md ${loading ? "bg-gray-500" : "bg-[#742F1E]"
                  }`}
              >
                {loading ? "กำลังส่ง..." : "ยืนยัน"} <span className="text-xl">►</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: สำเร็จ */}
        {step === 5 && (
          <div className="w-full min-h-[60vh]">
            <h2 className="text-xl font-bold text-center mt-12 xs:mt-16">ทำรายการสำเร็จ</h2>
            <Image className="my-4 w-full" src="/img/Asset 279.png" width={500} height={500} alt="Success" />
            <p className="px-2 text-center w-full text-wrap text-xl text-gray-700">
              ขอนุโมทนากับคุณ {profile.displayName}
            </p>
            <p className="mt-2 px-2 text-center text-xl text-gray-700">ที่ได้ร่วมกองบุญ</p>
            <p className="px-2 text-center w-full text-wrap text-xl text-gray-700">#{campaigns.name}</p>
            <div className="flex justify-center">
              <Image className="rounded-lg" src="/img/AdminLogo.png" width={200} height={200} alt="Success" />
            </div>
            <Image className="mt-2 w-full" src="/img/Asset 279.png" width={500} height={500} alt="Success" />
            <div>
              <button
                onClick={() => (window.location.href = "/line/index")}
                className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-6 bg-[#742F1E] font-semibold text-white rounded-full shadow-md"
              >
                กลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        )}
      </div>


      <div className="relative flex bottom-0 mt-10 bg-cover bg-center w-full min-w-[375px] max-w-[425px] h-[80px]">
        <Image src="/img/footerimg.png" fill sizes="425px" alt="Footer" />
      </div>
    </div>

  );
}
