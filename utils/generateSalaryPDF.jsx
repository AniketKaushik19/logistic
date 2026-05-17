"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   LOGO
========================================================= */
function addLogo(doc, base64) {
  doc.addImage(base64, "PNG", 14, 12, 20, 20);
}

/* =========================================================
   PUBLIC IMAGE → BASE64
========================================================= */
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

/* =========================================================
   FORMAT DATE
========================================================= */
function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   GENERATE PDF
========================================================= */
export async function generateSalaryPDF(
  salary
) {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  let currentY = 18;

  /* =====================================================
     COLORS
  ===================================================== */
  const primary = [37, 99, 235];
  const dark = [15, 23, 42];
  const gray = [100, 116, 139];

  /* =====================================================
     LOGO
  ===================================================== */
  const logoBase64 =
    await getBase64FromPublicImage(
      "/logo.png"
    );

  addLogo(doc, logoBase64);

  /* =====================================================
     COMPANY HEADER
  ===================================================== */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);

  doc.setTextColor(...primary);

  doc.text(
    "ANIKET LOGISTIC",
    pageWidth / 2 + 10,
    currentY,
    {
      align: "center",
    }
  );

  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.setTextColor(...gray);

  doc.text(
    "7A, Buddh Vihar Colony Kotwali Road,",
    pageWidth / 2,
    currentY,
    {
      align: "center",
    }
  );

  currentY += 5;

  doc.text(
    "Chinhat, Lucknow - 226028",
    pageWidth / 2,
    currentY,
    {
      align: "center",
    }
  );

  currentY += 5;

  doc.text(
    "Mob.: 7388533786",
    pageWidth / 2,
    currentY,
    {
      align: "center",
    }
  );

  currentY += 12;

  /* =====================================================
     DIVIDER
  ===================================================== */
  doc.setDrawColor(220);

  doc.line(
    14,
    currentY,
    pageWidth - 14,
    currentY
  );

  currentY += 10;

  /* =====================================================
     TITLE
  ===================================================== */
  doc.setFont("helvetica", "bold");

  doc.setFontSize(15);

  doc.setTextColor(...dark);

  doc.text(
    "DRIVER SALARY SLIP",
    pageWidth / 2,
    currentY,
    {
      align: "center",
    }
  );

  currentY += 12;

  /* =====================================================
     INFO CARD
  ===================================================== */
  doc.setFillColor(248, 250, 252);

  doc.roundedRect(
    14,
    currentY - 5,
    pageWidth - 28,
    30,
    3,
    3,
    "F"
  );

  doc.setFont("helvetica", "normal");

  doc.setFontSize(11);

  doc.setTextColor(...dark);

  doc.text(
    `Month:${formatDate(
      salary.month || "-"
    )}`,
    20,
    currentY + 2
  );

  doc.text(
    `Driver Name: ${
      salary.driverName || "-"
    }`,
    20,
    currentY + 10
  );

  doc.text(
    `Salary Amount: ₹ ${
      salary.salary || 0
    }`,
    pageWidth - 70,
    currentY + 2
  );

  doc.text(
    `Advance: ₹ ${
      salary.advance || 0
    }`,
    pageWidth - 70,
    currentY + 10
  );

  doc.text(
    `Bonus: ₹ ${salary.bonus || 0}`,
    pageWidth - 70,
    currentY + 18
  );

  currentY += 38;

  /* =====================================================
     TRANSACTION TABLE
  ===================================================== */
  autoTable(doc, {
    startY: currentY,

    theme: "grid",

    head: [["Description", "Amount"]],

    body: [
      [
        "Salary Amount",
        `₹ ${salary.salary || 0}`,
      ],

      [
        "Advance Deduction",
        `₹ ${salary.advance || 0}`,
      ],

      [
        "Bonus",
        `₹ ${salary.bonus || 0}`,
      ],
    ],

    styles: {
      fontSize: 11,

      cellPadding: 4,

      textColor: dark,
    },

    headStyles: {
      fillColor: primary,

      textColor: 255,

      halign: "center",

      fontStyle: "bold",
    },

    bodyStyles: {
      halign: "left",
    },

    columnStyles: {
      0: {
        halign: "left",
      },
    },
  });

  currentY =
    doc.lastAutoTable.finalY + 12;

  /* =====================================================
     NET PAY SECTION
  ===================================================== */

  const net =
    Number(salary.salary || 0) -
    Number(salary.advance || 0);

  doc.setFillColor(239, 246, 255);

  doc.roundedRect(
    14,
    currentY - 2,
    pageWidth - 28,
    24,
    3,
    3,
    "F"
  );

  doc.setFont("helvetica", "bold");

  doc.setFontSize(14);

  doc.setTextColor(...primary);
 doc.text(
    `Total: ₹ ${net}`,
    20,
    currentY + 8
  );

  doc.setFontSize(10);

  doc.setFont("helvetica", "normal");

  doc.setTextColor(...gray);

  doc.text(
    `Paid At: ${formatDate(
      salary.paidAt
    )}`,
    20,
    currentY + 16
  );

  currentY += 38;

  /* =====================================================
     SIGNATURE AREA
  ===================================================== */
  doc.setDrawColor(180);

  doc.line(
    pageWidth - 70,
    currentY,
    pageWidth - 20,
    currentY
  );

  doc.setFontSize(10);

  doc.setTextColor(...gray);

  doc.text(
    "Authorized Signature",
    pageWidth - 45,
    currentY + 5,
    {
      align: "center",
    }
  );

  /* =====================================================
     FOOTER
  ===================================================== */
  doc.setFont("helvetica", "italic");

  doc.setFontSize(9);

  doc.setTextColor(...gray);

  doc.text(
    "This is a computer generated salary slip.",
    pageWidth / 2,
    pageHeight - 12,
    {
      align: "center",
    }
  );

  /* =====================================================
     SAVE
  ===================================================== */
  doc.save(
    `Salary_Slip_${salary.driverName}_${salary.month}.pdf`
  );
}