"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateSalaryPDF(salary) {
  const doc = new jsPDF("p", "mm", "a4");

  /* ================= HEADER ================= */
  doc.setFontSize(18);
  doc.text("DRIVER SALARY SLIP", 105, 20, { align: "center" });

  doc.setFontSize(11);
  doc.text(`Month: ${salary.month}`, 14, 35);
  doc.text(`Driver Name: ${salary.driverName}`, 14, 42);
  doc.text(`Status: ${salary.status}`, 150, 42);

  /* ================= SALARY TABLE ================= */
  autoTable(doc, {
    startY: 55,
    theme: "grid",
    head: [["Description", "Amount (Rs.)"]],
    body: [
      ["Base Salary", salary.baseSalary || 0],
      ["Advance", salary.advance || 0],
      ["Bonus", salary.bonus || 0],
      ["Penalty", salary.penalty || 0],
    ],
    styles: {
      fontSize: 11,
      halign: "right",
    },
    headStyles: {
      fillColor: [30, 64, 175], // blue
      halign: "center",
      textColor: 255,
    },
    columnStyles: {
      0: { halign: "left" },
    },
  });

  /* ================= NET PAY ================= */
  const net =
    (salary.baseSalary || 0) +
    (salary.bonus || 0) -
    (salary.penalty || 0) -
    (salary.advance || 0);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    theme: "plain",
    body: [
      ["Net Payable", `Rs. ${net}`],
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
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.text(
    "This is a system generated salary slip.",
    105,
    pageHeight - 20,
    { align: "center" }
  );

  /* ================= SAVE ================= */
  doc.save(`Salary_Slip_${salary.driverName}_${salary.month}.pdf`);
}
