import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
   GENERATE SALARY HISTORY PDF
========================================================= */
export const generateSalaryHistoryPDF = ({
  driver,
  filters,
  data,
}) => {
  const doc = new jsPDF(
    "p",
    "mm",
    "a4"
  );

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  /* =====================================================
     COLORS
  ===================================================== */
  const primary = [37, 99, 235];
  const dark = [15, 23, 42];
  const gray = [100, 116, 139];

  let currentY = 18;

  /* =====================================================
     HEADER
  ===================================================== */
  doc.setFont("helvetica", "bold");

  doc.setFontSize(20);

  doc.setTextColor(...primary);

  doc.text(
    "DRIVER SALARY REPORT",
    pageWidth / 2,
    currentY,
    {
      align: "center",
    }
  );

  currentY += 10;

  doc.setDrawColor(220);

  doc.line(
    14,
    currentY,
    pageWidth - 14,
    currentY
  );

  currentY += 10;

  /* =====================================================
     DRIVER INFO CARD
  ===================================================== */
  doc.setFillColor(248, 250, 252);

  doc.roundedRect(
    14,
    currentY - 4,
    pageWidth - 28,
    28,
    3,
    3,
    "F"
  );

  doc.setFont("helvetica", "normal");

  doc.setFontSize(11);

  doc.setTextColor(...dark);

  doc.text(
    `Driver Name: ${
      driver.name || "-"
    }`,
    20,
    currentY + 4
  );

  doc.text(
    `Generated On: ${formatDate(
      new Date()
    )}`,
    20,
    currentY + 12
  );

  /* =====================================================
     FILTER TEXT
  ===================================================== */

  let filterText = "All Records";

  const appliedFilters = [];

  if (filters.year !== "all") {
    appliedFilters.push(
      `Year: ${filters.year}`
    );
  }

  if (filters.month !== "all") {
    appliedFilters.push(
      `Month: ${filters.month}`
    );
  }

  if (filters.fromDate) {
    appliedFilters.push(
      `From: ${formatDate(
        filters.fromDate
      )}`
    );
  }

  if (filters.toDate) {
    appliedFilters.push(
      `To: ${formatDate(
        filters.toDate
      )}`
    );
  }

  if (appliedFilters.length > 0) {
    filterText =
      appliedFilters.join(" | ");
  }

  doc.setTextColor(...gray);

  doc.setFontSize(10);

  doc.text(
    `Filters: ${filterText}`,
    20,
    currentY + 20
  );

  currentY += 38;

  /* =====================================================
     TABLE DATA
  ===================================================== */
  const rows = data.map(
    (item, index) => {
      const netPay =
        Number(item.salary || 0) -
        Number(item.advance || 0);

      return [
        index + 1,

        item.month || "-",

        ` ${
          item.salary || 0
        }`,

        ` ${
          item.advance || 0
        }`,

        ` ${
          item.bonus || 0
        }`,

        ` ${netPay}`,

        formatDate(item.createdAt),
      ];
    }
  );

  /* =====================================================
     TABLE
  ===================================================== */
  autoTable(doc, {
    startY: currentY,

    head: [
      [
        "#",
        "Month",
        "Salary",
        "Advance",
        "Bonus",
        "Net Pay",
        "Date",
      ],
    ],

    body: rows,

    theme: "grid",

    styles: {
      fontSize: 10,

      cellPadding: 4,

      valign: "middle",
    },

    headStyles: {
      fillColor: primary,

      textColor: 255,

      fontStyle: "bold",

      halign: "center",
    },

    bodyStyles: {
      textColor: dark,
    },

    columnStyles: {
      0: {
        halign: "center",
        cellWidth: 10,
      },

      1: {
        halign: "center",
      },

      2: {
        halign: "right",
      },

      3: {
        halign: "right",
      },

      4: {
        halign: "right",
      },

      5: {
        halign: "right",
        fontStyle: "bold",
      },

      6: {
        halign: "center",
      },
    },
  });

  /* =====================================================
     TOTALS
  ===================================================== */

  const totalSalary = data.reduce(
    (sum, item) =>
      sum +
      Number(item.salary || 0),
    0
  );

  const totalAdvance = data.reduce(
    (sum, item) =>
      sum +
      Number(item.advance || 0),
    0
  );

  const totalBonus = data.reduce(
    (sum, item) =>
      sum +
      Number(item.bonus || 0),
    0
  );

  const totalNet =
    totalSalary - totalAdvance;

  currentY =
    doc.lastAutoTable.finalY + 12;

  doc.setFillColor(239, 246, 255);

  doc.roundedRect(
    14,
    currentY - 3,
    pageWidth - 28,
    28,
    3,
    3,
    "F"
  );

  doc.setFont("helvetica", "bold");

  doc.setFontSize(11);

  doc.setTextColor(...primary);

  doc.text(
    `Total Salary:  ${totalSalary}`,
    20,
    currentY + 6
  );

  doc.text(
    `Total Advance:  ${totalAdvance}`,
    20,
    currentY + 14
  );

  doc.text(
    `Total Bonus:  ${totalBonus}`,
    pageWidth - 80,
    currentY + 6
  );

   /* =====================================================
     FOOTER
  ===================================================== */
  doc.setFont("helvetica", "italic");

  doc.setFontSize(9);

  doc.setTextColor(...gray);

  doc.text(
    "This is a system generated salary history report.",
    pageWidth / 2,
    pageHeight - 10,
    {
      align: "center",
    }
  );

  /* =====================================================
     SAVE
  ===================================================== */
  doc.save(
    `Salary_Report_${driver.name}.pdf`
  );
};