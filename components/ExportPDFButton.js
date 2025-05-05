"use client";
import { jsPDF } from "jspdf";
import { THSarabunFont } from "@/fonts/THSarabun";

const ExportPDF = ({ data }) => {
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "cm",
      format: [6, 4],
    });

    // เพิ่มฟอนต์
    doc.addFileToVFS("THSarabun.ttf", THSarabunFont);
    doc.addFont("THSarabun.ttf", "THSarabun", "normal");
    doc.setFont("THSarabun");

    data.forEach((item, index) => {
      if (index > 0) doc.addPage();

      const name =
        [item.detailsname, item.details].find(
          (text) => typeof text === "string" && text.trim() !== ""
        ) || "ไม่ระบุชื่อ";

      doc.setFontSize(16);

      const lines = doc.splitTextToSize(name, 4.2); // จำกัดความกว้างให้พอดีช่อง

      // ✅ คำนวณจัดข้อความให้อยู่กึ่งกลางแนวตั้ง
      const lineHeight = 0.6; // ปรับตามขนาด font
      const totalHeight = lines.length * lineHeight;
      const startY = 0.2 + (3.6 - totalHeight) / 2;

      // ✅ วาดข้อความแบบจัดกึ่งกลางแนวนอน
      lines.forEach((line, i) => {
        doc.text(line, 2.3, startY + i * lineHeight, { align: "center" }); // 2.3 คือกึ่งกลางแนวนอนของช่องซ้าย (0.2 ถึง 4.5)
      });

      // ✅ วาดกรอบและเส้นแบ่ง
      doc.setLineWidth(0.1);
      doc.rect(0.2, 0.2, 5.6, 3.6); // กรอบรอบนอก
      doc.line(4.5, 0.2, 4.5, 3.8); // เส้นแบ่งซ้าย-ขวา
    });

    doc.save("รายชื่อ.pdf");
  };

  return <button onClick={exportToPDF}>ส่งออก PDF ภาษาไทย</button>;
};

export default ExportPDF;
