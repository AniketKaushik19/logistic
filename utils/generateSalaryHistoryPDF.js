import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateSalaryHistoryPDF = ({
  driver,
  filters,
  data,
}) => {
  const doc = new jsPDF();

  /* ===== HEADER ===== */
  doc.setFontSize(14);
  doc.text("Driver Salary Report", 14, 15);

  doc.setFontSize(10);
  doc.text(`Driver: ${driver.name}`, 14, 22);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 150, 22);

  /* ===== FILTER INFO ===== */
  let filterText = "Filters: ";
  filterText += filters.year !== "all" ? `Year ${filters.year}, ` : "";
  filterText += filters.month !== "all" ? `Month ${filters.month}, ` : "";
  filterText += filters.fromDate ? `From ${filters.fromDate}, ` : "";
  filterText += filters.toDate ? `To ${filters.toDate}` : "";

  doc.text(filterText || "Filters: None", 14, 28);

  /* ===== TABLE DATA ===== */
  const rows = data.map((item, i) => {
    const netPay = item.markPaid
      ? Number(item.bonus || 0) -
        Number(item.advance || 0) -
        Number(item.penalty || 0)
      : Number(item.baseSalary || 0) +
        Number(item.bonus || 0) -
        Number(item.advance || 0) -
        Number(item.penalty || 0);

    return [
      i + 1,
      item.month,
      item.baseSalary || "-",
      item.bonus || "-",
      item.advance || "-",
      item.penalty || "-",
      netPay,
      item.markPaid ? "Paid" : "Unpaid",
    ];
  });

  autoTable(doc, {
    startY: 35,
    head: [[
      "#",
      "Month",
      "Base Salary",
      "Bonus",
      "Advance",
      "Penalty",
      "Net Pay",
      "Status",
    ]],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 59] },
  });

  /* ===== TOTAL ===== */
  const totalNet = rows.reduce(
    (sum, r) => sum + Number(r[6] || 0),
    0
  );

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.text(`Total Net Pay: ₹ ${totalNet}`, 14, finalY);

  doc.save(`Salary_Report_${driver.name}.pdf`);
};
