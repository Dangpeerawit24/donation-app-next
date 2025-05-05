'use client';
import { jsPDF } from 'jspdf';
import { THSarabunFont } from '@/fonts/THSarabun';

const ExportPDF = ({ data }) => {
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'cm',
      format: [6, 4]
    });

    // เพิ่มฟอนต์
    doc.addFileToVFS("THSarabun.ttf", THSarabunFont);
    doc.addFont("THSarabun.ttf", "THSarabun", "normal");
    doc.setFont("THSarabun");

    data.forEach((item, index) => {
      if (index > 0) doc.addPage();

      const name = item.detailsname || "ไม่ระบุชื่อ";

      doc.setFontSize(16);
      doc.text(name, 3, 2, { align: 'center' });

      doc.setLineWidth(0.1);
      doc.rect(0.2, 0.2, 5.6, 3.6);
    });

    doc.save("รายชื่อ.pdf");
  };

  return <button onClick={exportToPDF}>ส่งออก PDF ภาษาไทย</button>;
};

export default ExportPDF;
