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

      // ✅ ขยายความกว้างให้ใช้พื้นที่เต็ม (ลบเส้นกลางแล้ว)
      const lines = doc.splitTextToSize(name, 5.2); // เดิม 4.2 ตอนมีเส้นกลาง

      // ✅ คำนวณจัดกลางแนวตั้ง
      const lineHeight = 0.6;
      const totalHeight = lines.length * lineHeight;
      const startY = 0.2 + (3.6 - totalHeight) / 2;

      // ✅ จัดกึ่งกลางแนวนอน (ใช้ 3.0 เพราะกึ่งกลางของกรอบ 5.6 cm)
      lines.forEach((line, i) => {
        doc.text(line, 3.0, startY + i * lineHeight, { align: "center" });
      });

      // ✅ วาดกรอบ (ไม่มีเส้นแบ่งแล้ว)
      doc.setLineWidth(0.1);
      doc.rect(0.2, 0.2, 5.6, 3.6); // กรอบเต็มพื้นที่
    });

    doc.save("รายชื่อ.pdf");
  };

  return <button onClick={exportToPDF}>ส่งออก PDF ภาษาไทย</button>;
};

export default ExportPDF;
