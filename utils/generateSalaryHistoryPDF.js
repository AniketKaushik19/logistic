import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   FORMAT DATE
========================================================= */
function formatDate(date) {
  if (!date) return "-";

  // For month values like 2026-05
  if (
    typeof date === "string" &&
    /^\d{4}-\d{2}$/.test(date)
  ) {
    const [year, month] = date.split("-");

    return new Date(
      Number(year),
      Number(month) - 1
    ).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  }

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
    "landscape",
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

  let currentY = 16;

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

  currentY += 8;

  doc.setDrawColor(220);

  doc.line(
    12,
    currentY,
    pageWidth - 12,
    currentY
  );

  currentY += 10;

  /* =====================================================
     DRIVER INFO CARD
  ===================================================== */

  doc.setFillColor(248, 250, 252);

  doc.roundedRect(
    12,
    currentY - 4,
    pageWidth - 24,
    30,
    3,
    3,
    "F"
  );

  doc.setFont("helvetica", "normal");

  doc.setFontSize(11);

  doc.setTextColor(...dark);

  doc.text(
    `Driver Name: ${driver.name || "-"}`,
    18,
    currentY + 3
  );

  doc.text(
    `Contact: ${
      driver.contactNumber || "-"
    }`,
    18,
    currentY + 11
  );

  doc.text(
    `Vehicle: ${
      driver.vehicleNumber || "-"
    }`,
    pageWidth / 2,
    currentY + 3
  );

  doc.text(
    `Generated On: ${formatDate(
      new Date()
    )}`,
    pageWidth / 2,
    currentY + 11
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

  doc.setFontSize(10);

  doc.setTextColor(...gray);

  doc.text(
    `Filters: ${filterText}`,
    18,
    currentY + 22
  );

  currentY += 36;

  /* =====================================================
     TABLE DATA
  ===================================================== */

  const rows = data.map((item) => {
    const isAdvanceGiven =
      item.transactionType ===
      "ADVANCE_GIVEN";

    const isSalaryPaid =
      item.transactionType ===
      "SALARY_PAID";

    const salaryAmount =
      isSalaryPaid
        ? Number(item.salary || 0)
        : 0;

    const advanceGiven =
      isAdvanceGiven
        ? Number(item.advance || 0)
        : 0;

    const advanceSettled =
      isSalaryPaid
        ? Number(item.advance || 0)
        : 0;

    const bonusAmount = Number(
      item.bonus || 0
    );

    const netPay = isSalaryPaid
      ? Number(item.netPay || 0)
      : 0;

    return [
      formatDate(item.month),

      isAdvanceGiven
        ? "Advance Given"
        : "Salary Paid",

      salaryAmount.toLocaleString(
        "en-IN"
      ),

      advanceGiven.toLocaleString(
        "en-IN"
      ),

      advanceSettled.toLocaleString(
        "en-IN"
      ),

      bonusAmount.toLocaleString(
        "en-IN"
      ),

      netPay.toLocaleString(
        "en-IN"
      ),

      formatDate(item.createdAt),
    ];
  });

  /* =====================================================
     TABLE
  ===================================================== */

  autoTable(doc, {
    startY: currentY,

    head: [
      [
        "Month",
        "Transaction Type",
        "Salary",
        "Advance Given",
        "Advance Settled",
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
      halign: "center",
      overflow: "linebreak",
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
      textColor: dark,
    },

    headStyles: {
      fillColor: primary,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },

    columnStyles: {
      0: {
        cellWidth: 32,
      },

      1: {
        cellWidth: 48,
        halign: "left",
      },

      2: {
        cellWidth: 32,
        halign: "right",
      },

      3: {
        cellWidth: 36,
        halign: "right",
      },

      4: {
        cellWidth: 36,
        halign: "right",
      },

      5: {
        cellWidth: 32,
        halign: "right",
      },

      6: {
        cellWidth: 36,
        halign: "right",
        fontStyle: "bold",
      },

      7: {
        cellWidth: 40,
      },
    },

    margin: {
      left: 12,
      right: 12,
    },
  });

  /* =====================================================
     TOTALS
  ===================================================== */

  const totalSalary = data.reduce(
    (sum, item) =>
      sum +
      (item.transactionType ===
      "SALARY_PAID"
        ? Number(item.salary || 0)
        : 0),
    0
  );

  const totalAdvance = data.reduce(
    (sum, item) =>
      sum +
      (item.transactionType ===
      "ADVANCE_GIVEN"
        ? Number(item.advance || 0)
        : 0),
    0
  );

  const totalAdvanceSettled = data.reduce(
    (sum, item) =>
      sum +
      (item.transactionType ===
      "SALARY_PAID"
        ? Number(item.advance || 0)
        : 0),
    0
  );

  const totalBonus = data.reduce(
    (sum, item) =>
      sum + Number(item.bonus || 0),
    0
  );

  const totalNet = data.reduce(
    (sum, item) =>
      sum +
      (item.transactionType ===
      "SALARY_PAID"
        ? Number(item.netPay || 0)
        : 0),
    0
  );

  currentY =
    doc.lastAutoTable.finalY + 10;

  doc.setFillColor(239, 246, 255);

  doc.roundedRect(
    12,
    currentY - 2,
    pageWidth - 24,
    24,
    3,
    3,
    "F"
  );

  doc.setFont("helvetica", "bold");

  doc.setFontSize(11);

  doc.setTextColor(...primary);

  doc.text(
    `Total Salary: ${totalSalary.toLocaleString(
      "en-IN"
    )}`,
    18,
    currentY + 6
  );

  doc.text(
    `Total Advance Given: ${totalAdvance.toLocaleString(
      "en-IN"
    )}`,
    90,
    currentY + 6
  );

  doc.text(
    `Total Advance Settled: ${totalAdvanceSettled.toLocaleString(
      "en-IN"
    )}`,
    175,
    currentY + 6
  );

  doc.text(
    `Total Bonus: ${totalBonus.toLocaleString(
      "en-IN"
    )}`,
    18,
    currentY + 14
  );

  doc.text(
    `Total Net Pay: ${totalNet.toLocaleString(
      "en-IN"
    )}`,
    90,
    currentY + 14
  );

  /* =====================================================
     FOOTER
  ===================================================== */

  doc.setFont(
    "helvetica",
    "italic"
  );

  doc.setFontSize(9);

  doc.setTextColor(...gray);

  doc.text(
    "This is a system generated salary history report.",
    pageWidth / 2,
    pageHeight - 8,
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