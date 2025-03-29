"use client";

import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import { useParams } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const PushImages = () => {
  const { transactionID } = useParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [fileInputs, setFileInputs] = useState([]);
  const [transactionData, setTransactionData] = useState(null);
  const maxFileInputs = 5;

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/line/get-transaction?transactionID=${transactionID}`);
      const data = await res.json();
      setTransactionData(data.transaction[0]);
    }
    fetchData();
  }, []);

  const promptPin = useCallback(() => {
    Swal.fire({
      title: "กรอกรหัส PIN",
      input: "password",
      inputAttributes: {
        maxlength: 6,
        autocapitalize: "off",
        autocorrect: "off",
      },
      allowOutsideClick: false,
      confirmButtonText: "ยืนยัน",
      preConfirm: (pin) => {
        if (pin === process.env.NEXT_PUBLIC_PIN_PUSHIMAGE) {
          return true;
        } else {
          Swal.showValidationMessage("รหัส PIN ไม่ถูกต้อง");
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const now = Date.now();
        localStorage.setItem("pushImagesAuthTime", now.toString());
        setAuthenticated(true);
      }
    });
  }, []);

  useEffect(() => {
    const oneHour = 60 * 60 * 1000;
    const storedTime = localStorage.getItem("pushImagesAuthTime");

    if (storedTime) {
      const timeDiff = Date.now() - parseInt(storedTime, 10);
      if (timeDiff < oneHour) {
        setAuthenticated(true);
      } else {
        localStorage.removeItem("pushImagesAuthTime");
        promptPin();
      }
    } else {
      promptPin();
    }

    const interval = setInterval(() => {
      const storedTime = localStorage.getItem("pushImagesAuthTime");
      if (storedTime) {
        const timeDiff = Date.now() - parseInt(storedTime, 10);
        if (timeDiff >= oneHour) {
          localStorage.removeItem("pushImagesAuthTime");
          setAuthenticated(false);
          promptPin();
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [promptPin]);

  if (!authenticated) {
    return null;
  }

  const handleAddFileInput = () => {
    if (fileInputs.length < maxFileInputs) {
      setFileInputs((prev) => [...prev, { id: Date.now() }]);
    } else {
      Swal.fire({
        icon: "warning",
        title: "ข้อจำกัดในการเพิ่มไฟล์",
        text: "คุณสามารถเพิ่มช่องอัปโหลดไฟล์ได้สูงสุด 5 ช่องเท่านั้น!",
        confirmButtonText: "ตกลง",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const handleRemoveFileInput = (id) => {
    setFileInputs((prev) => prev.filter((input) => input.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const allFileInputs = Array.from(form.querySelectorAll('input[type="file"]'));
    const hasFile = allFileInputs.some((input) => input.files && input.files.length > 0);

    if (!hasFile) {
      Swal.fire({
        text: "คุณยังไม่ได้เลือกไฟล์ กรุณาตรวจสอบอีกครั้ง",
        icon: "warning",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    Swal.fire({
      title: "กำลังประมวลผล",
      text: "กรุณารอสักครู่...",
      icon: "info",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
    });

    const formData = new FormData(form);

    try {
      const res = await fetch("/api/line/pushimages", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ส่งภาพกองบุญสำเร็จแล้ว",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = `/admin/manage-campaign/campaign-detail/${transactionData.campaignsid}`;
      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถส่งภาพ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  return (
    <>
      <div
        className="w-screen min-w-[375px] max-w-[425px] h-screen bg-cover bg-no-repeat px-0 m-0 flex flex-col"
        style={{ backgroundImage: "url('/img/Background2.png')" }}
      >
        <div
          className="w-screen min-w-[375px] max-w-[425px] fixed bg-top bg-no-repeat bg-contain h-[200px]"
          style={{ backgroundImage: "url('/img/bannerimg.png')" }}
        >
        </div>
        <div className="w-full flex justify-center items-center mt-[160px] xs:mt-[180px]">
          <h1 className="text-xl">อัพโหลดภาพส่งลูกบุญ</h1>
        </div>
        <Image
          className="mt-6 mb-2 px-6 w-full"
          src="/img/Asset 279.png"
          width={500}
          height={500}
          alt="Success"
        />
        <div className="w-full grid grid-cols-2 gap-2 px-6">
          <p className="text-md text-start">กองบุญ</p>
          <p className="text-md text-end text-nowrap truncate-text">{transactionData?.campaignsname}</p>
          <p className="text-md text-start">จำนวน</p>
          <p className="text-md text-end">{transactionData?.value}</p>
          <p className="text-md text-start">ชื่อไลน์</p>
          <p className="text-md text-end text-nowrap truncate-text">{transactionData?.lineName}</p>
        </div>
        <Image
          className="my-2 px-6 w-full"
          src="/img/Asset 279.png"
          width={500}
          height={500}
          alt="Success"
        />
        <div className="overflow-y-auto overflow-x-hidden w-full">
          <div className="w-full flex flex-col items-center justify-center gap-2 px-6">
            <form
              id="uploadForm"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="my-4"
            >
              {/* ส่วนแสดงช่องอัปโหลดไฟล์ */}
              <div className="w-full flex flex-col items-center justify-center gap-2 px-2" id="fileUploadContainer">
                {fileInputs.map((fileInput) => (
                  <div className="w-full rounded-full bg-gray-200 flex flex-row items-center justify-center py-2 px-4" key={fileInput.id}>
                    <input
                      type="file"
                      name="url_img[]"
                      className="file-input w-[280px]"
                      multiple
                    />
                    <button
                      type="button"
                      className="py-1 px-4 bg-red-500 rounded-lg text-white text-lg"
                      onClick={() => handleRemoveFileInput(fileInput.id)}
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <input type="hidden" name="id" value={transactionData?.id || ""} />
                <input type="hidden" name="campaignsname" value={transactionData?.campaignsname || ""} />
                <input type="hidden" name="userid" value={transactionData?.lineId || ""} />
              </div>

              <div className="w-full mt-4 flex flex-col items-center justify-center gap-2 px-6">
                <button
                  onClick={handleAddFileInput}
                  type="button"
                  className="py-2 px-4 bg-blue-500 rounded-lg text-white text-lg"
                >
                  เพิ่มรูป
                </button>
                <button className="py-2 px-4 bg-green-800 rounded-lg text-white text-lg" type="submit">
                  ยืนยันส่งภาพกองบุญ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PushImages;
