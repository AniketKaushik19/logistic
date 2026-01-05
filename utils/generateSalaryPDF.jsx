"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= LOGO ================= */
function addLogo(doc, base64) {
  doc.addImage(base64, "PNG", 14, 14, 18, 18);
}

/* ================= PUBLIC IMAGE → BASE64 ================= */
async function getBase64FromPublicImage(path) {
  const res = await fetch(path);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

export async function generateSalaryPDF(salary) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 20; // ⬅️ layout cursor

  /* ================= LOGO + COMPANY HEADER ================= */
  const logoBase64 = await getBase64FromPublicImage("/logo.png");
  addLogo(doc, logoBase64);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);
  doc.text("ANIKET LOGISTIC", pageWidth / 2 + 10, currentY, { align: "center" });

  currentY += 6;

  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");

  doc.text("7A, Buddh Vihar Colony Kotwali Road,", 14, currentY + 6);
  doc.text("Chinhat, Lucknow - 226028", 14, currentY + 11);
  doc.text("Mob.: 7388533786", 14, currentY + 16);

  currentY += 26;

  /* ================= TITLE ================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("DRIVER SALARY SLIP", pageWidth / 2, currentY, { align: "center" });

  currentY += 12;

  /* ================= META INFO ================= */
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text(`Month: ${salary.month}`, 14, currentY);
  doc.text(`Driver Name: ${salary.driverName}`, 14, currentY + 7);
  doc.text(`Monthly Salary Status: ${salary.status}`, pageWidth - 50, currentY + 7);
  doc.text(`Base Salary: ${salary.baseSalary || 0}`, 14, currentY + 14);

  currentY += 18;

  /* ================= SALARY TABLE ================= */
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["Description", "Amount (Rs.)"]],
    body: [
      ["Advance", salary.advance || 0],
      ["Bonus", salary.bonus || 0],
      ["Penalty", salary.penalty || 0],
    ],
    styles: {
      fontSize: 11,
      halign: "right",
    },
    headStyles: {
      fillColor: [30, 64, 175],
      halign: "center",
      textColor: 255,
    },
    columnStyles: {
      0: { halign: "left" },
    },
  });

  currentY = doc.lastAutoTable.finalY + 10;

  /* ================= NET PAY ================= */
const net = salary.status === "Paid"
  ?  (salary.bonus || 0) -
    (salary.penalty || 0) -
    (salary.advance || 0)
  : (salary.baseSalary || 0) +
    (salary.bonus || 0) -
    (salary.penalty || 0) -
    (salary.advance || 0);


  autoTable(doc, {
    startY: currentY,
    theme: "plain",
    body: [
      ["Net Payable ", `Rs. ${net}`],
      ["Paid At", salary.paidAt || "-"],
    ],
    styles: {
      fontSize: 12,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" },
    },
  });

  /* ================= FOOTER ================= */
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is a system generated salary slip.",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );

  /* ================= SAVE ================= */
  doc.save(`Salary_Slip_${salary.driverName}_${salary.month}.pdf`);
}
