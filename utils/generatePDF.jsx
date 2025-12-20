import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= PUBLIC IMAGE → BASE64 ================= */
async function getBase64FromPublicImage(path) {
  const res = await fetch(path);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(reader.result.split(",")[1]); // remove prefix
    reader.readAsDataURL(blob);
  });
}

/* ================= LOGO ================= */
function addLogo(doc, base64) {
  doc.addImage(base64, "JPEG", 12, 10, 18, 18);
}

/* ================= CHECKBOX ================= */
function checkbox(doc, x, y, checked) {
  doc.rect(x, y, 4, 4);
  if (checked) {
    doc.line(x + 0.8, y + 2, x + 1.8, y + 3);
    doc.line(x + 1.8, y + 3, x + 3.5, y + 0.5);
  }
}

/* ================= MAIN ================= */
export async function generatePDF(cn, payload) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const logoBase64 = await getBase64FromPublicImage("/logo.jpeg");

  /* ================= HEADER ================= */
  addLogo(doc, logoBase64);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(200, 0, 0);
  doc.text("ANIKET LOGISTIC", pageWidth / 2 + 5, 20, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(0);

  doc.text("7A, Uddh Vihar Colony Phase-2 Kowal Road,", 15, 30);
  doc.text("Chinhat, Lucknow - 227105", 15, 35);
  doc.text("Mob.: 7388533786", 15, 40);

  doc.text(`CONSIGNMENT NOTE No.: ${cn}`, pageWidth - 15, 30, { align: "right" });
  doc.text("PAN No.: CKTPK5713K", pageWidth - 15, 35, { align: "right" });
  doc.text(`Date: ${payload.consignmentDate || ""}`, pageWidth - 15, 40, { align: "right" });
  doc.text("CONSIGNOR COPY", pageWidth - 15, 45, { align: "right" });

  /* ================= OPTIONS ================= */
  doc.setFont("helvetica", "bold");
  doc.text("AT OWNER'S RISK", 15, 52);

  doc.setFont("helvetica", "normal");
  doc.text("DOOR DELIVERY", pageWidth - 80, 52);
  checkbox(doc, pageWidth - 45, 49, payload.doorDelivery === "YES");
  doc.text("YES", pageWidth - 38, 52);
  checkbox(doc, pageWidth - 25, 49, payload.doorDelivery === "NO");
  doc.text("NO", pageWidth - 18, 52);

  /* ================= CONSIGNEE ================= */
  autoTable(doc, {
    startY: 58,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [[
      `Consignee's Name & Address\n${payload.consigneeName || ""}\n${payload.consigneeAddress || ""}`,
      `Delivery Address\n${payload.deliveryAddress || ""}`
    ]],
    columnStyles: { 0: { cellWidth: 95 }, 1: { cellWidth: 95 } }
  });

  /* ================= PAYMENT CONTROL ================= */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [[`CONTROL WILL BE PAID BY ${payload.paymentType || "CONSIGNOR"}`]]
  });

  /* ================= CONSIGNOR / TAX ================= */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [[
      `Consignor's Name & Address\n${payload.consignorName || ""}\n${payload.consignorAddress || ""}`,
      "Consignor C.S.T. No\n—",
      "Consignee C.S.T. No\n—",
      "Sales Tax / Permit / Declaration\nApplicable as per rule",
      "Valid up to\n—",
      "Date\n—"
    ]],
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 }
    }
  });

  /* ================= DEMURRAGE ================= */
  const demY = doc.lastAutoTable.finalY + 6;
  doc.setFont("helvetica", "bold");
  doc.text("SCHEDULE OF DEMURRAGE CHARGES", pageWidth / 2, demY, { align: "center" });

  autoTable(doc, {
    startY: demY + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [
      ["DOOR DELIVERY RATES", "UNLOADING WILL BE EXTRA"],
      ["Drum / Cartons / Packages", "Labour Charges As Applicable"],
      ["Demurrage After Free Time", "Oil / Weight Charges Extra"]
    ],
    columnStyles: { 0: { cellWidth: 95 }, 1: { cellWidth: 95 } }
  });

  /* ================= ROUTE ================= */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [[
      `Phone\n${payload.consignorPhone || ""}`,
      "Fax\n—",
      `From\n${payload.fromLocation || ""}`,
      `To\n${payload.toLocation || ""}`
    ]],
    columnStyles: {
      0: { cellWidth: 48 },
      1: { cellWidth: 48 },
      2: { cellWidth: 48 },
      3: { cellWidth: 48 }
    }
  });

  /* ================= GOODS ================= */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    theme: "grid",
    head: [["Packages", "Method", "Description (Said to Contain)"]],
    body: [[
      payload.packageCount || "",
      payload.packageMethod || "",
      payload.goodsDescription || ""
    ]]
  });

  /* ================= INVOICE ================= */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [[
      `Invoice No\n${payload.invoiceNo || ""}`,
      `Rate / Kg\n${payload.rateperkg || ""}`,
      "Measurement\n—",
      "Paid at\n—",
      `Invoice Value\n${payload.invoiceValue || ""}`
    ]]
  });

  /* ================= WEIGHT ================= */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [[
      `Weight (Actual)\n${payload.weightActual || ""}`,
      `Weight (Charged)\n${payload.weightCharged || ""}`,
      `Freight\n${payload.freight || ""}`,
      "Billed at\n—",
      "Paid at\n—"
    ]]
  });

  /* ================= WARNING ================= */
  doc.setFont("helvetica", "bold");
  doc.text(
    "DO NOT PAY CASH TO LORRY DRIVER",
    15,
    doc.lastAutoTable.finalY + 10
  );

  /* ================= CHARGES ================= */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 14,
    theme: "grid",
    styles: { fontSize: 9 },
    head: [["Freight", "Risk", "Surcharge", "Hamali", "Driver", "Service", "TOTAL"]],
    body: [[
      payload.freight || "",
      "—",
      "—",
      "—",
      payload.driverName || "",
      "—",
      payload.amount || ""
    ]]
  });

  /* ================= DELIVERY ACK ================= */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    theme: "grid",
    styles: { fontSize: 9 },
    head: [["Delivery Remarks", "Stamp & Signature", "Date", "Lorry No"]],
    body: [["", "", payload.deliveryDate || "", payload.lorryNo || ""]]
  });

  /* ================= SIGNATURE ================= */
  const sigY = doc.lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "bold");
  doc.text("AL", 15, sigY);
  doc.text("Name", 60, sigY);
  doc.text("Signature", 120, sigY);
  doc.text("Code", 175, sigY);

  doc.save(`${cn}-Consignment-Note.pdf`);
}
