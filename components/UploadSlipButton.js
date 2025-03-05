import { useState } from "react";

const UploadSlipButton = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  return (
    <div className="flex flex-col items-center">
      {/* ✅ ปุ่มอัปโหลด */}
      <label className="cursor-pointer bg-gray-400 text-white py-3 px-6 rounded-full w-full max-w-xs text-center text-lg font-semibold hover:bg-gray-500 transition-all duration-300">
        อัปโหลดรูปภาพสลิป
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {/* ✅ แสดงชื่อไฟล์ที่เลือก */}
      {selectedFile && (
        <p className="mt-2 text-gray-600 text-sm">
          📄 {selectedFile.name}
        </p>
      )}
    </div>
  );
};

export default UploadSlipButton;
