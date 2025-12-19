import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generatePDF(cn, payload) {
  const doc = new jsPDF();

  // 🔴 Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 0, 0);
  doc.text("ANIKET LOGISTIC", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

  doc.setTextColor(0);
  doc.setFontSize(9);

  // Left side
  doc.text("7A, Uddh Vihar Colony Phase-2 Kowal Road,", 15, 28);
  doc.text("Chinhat Lucknow-270126", 15, 33);
  doc.text("Mob.: 7388533786", 15, 38);

  // Right side
  const rightX = doc.internal.pageSize.getWidth() - 15;
  doc.text(`CONSIGNMENT NOTE No.: ${cn}`, rightX, 28, { align: "right" });
  doc.text(`GST No.: ${payload.gstin}`, rightX, 33, { align: "right" });
  doc.text(`${payload.routeCode}`, rightX, 38, { align: "right" });
  doc.text(`Date: ${payload.consignmentDate}`, rightX, 43, { align: "right" });
  doc.text("CONSIGNOR COPY", rightX, 48, { align: "right" });

  // ⚠️ Risk Notice
  doc.setFont("helvetica", "bold");
  doc.text("AT OWNER'S RISK", 15, 55);

  // 📦 Consignee & Delivery
  autoTable(doc, {
    startY: 58,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [
      [
        `Consignee's Name & Address\n${payload.consigneeName}\n${payload.consigneeAddress}`,
        `Delivery Address\n${payload.deliveryAddress}`
      ]
    ],
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: 95 }
    }
  });

  // 💳 Payment Responsibility
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [[`CONTROL WILL BE PAID BY ${payload.paymentResponsibility}`]]
  });

  // 🧾 Tax & Declaration
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [
      [
        `Consignor's Name & Address\n${payload.consignorName}\n${payload.consignorAddress}`,
        `Consignor C.S.T. No\n${payload.consignorCSTNo}`,
        `Consignee C.S.T. No\n${payload.consigneeCSTNo}`,
        `Sales Tax/Permit/Declaration\n${payload.salesTaxDeclaration}`,
        `Valid up to\n${payload.validUpTo}`,
        `Date\n${payload.taxDate}`
      ]
    ],
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 }
    }
  });

  // 📋 Demurrage Notice
  const demStart = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SCHEDULE OF DEMURRAGE CHARGES", doc.internal.pageSize.getWidth() / 2, demStart, { align: "center" });

  autoTable(doc, {
    startY: demStart + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [
      ["DOOR DELIVERY RATES", "UNLOADING WILL BE"],
      ["Drum/Cartons/Packages", "Labor Charges Rs."],
      ["Demurrage will be charged after days", "Oil on weight charges"]
    ],
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: 95 }
    }
  });

  // 📞 Contact & Route
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [[
      `Phone\n${payload.consignorPhone}`,
      `Fax\n${payload.consignorFax}`,
      `From\n${payload.fromLocation}`,
      `To\n${payload.toLocation}`
    ]],
    columnStyles: {
      0: { cellWidth: 48 },
      1: { cellWidth: 48 },
      2: { cellWidth: 48 },
      3: { cellWidth: 48 }
    }
  });

  // 📦 Package Details
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    head: [["Packages", "Method", "Description (Said to Contain)"]],
    body: [[payload.packageCount, payload.packageMethod, payload.goodsDescription]]
  });

  // 💰 Invoice & Charges
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [[
      `Invoice No\n${payload.invoiceNo}`,
      `Rate per Kg\n${payload.rateperkg}`,
      `Measurement\n${payload.measurement}`,
      `Paid at\n${payload.paidAt}`,
      `Total Value\n${payload.invoiceValue}`
    ]],
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 38 },
      2: { cellWidth: 38 },
      3: { cellWidth: 38 },
      4: { cellWidth: 38 }
    }
  });

  // ⚖️ Weight & Freight
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    theme: "grid",
    styles: { fontSize: 9 },
    body: [[
      `Weight (Actual)\n${payload.weightActual}`,
      `Weight (Charged)\n${payload.weightCharged}`,
      `Freight\n${payload.freight}`,
      `Billed at\n${payload.billedAt}`,
      `Paid at\n${payload.paidAt}`
    ]],
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 38 },
      2: { cellWidth: 38 },
      3: { cellWidth: 38 },
      4: { cellWidth: 38 }
    }
  });

  // 🚫 Cash Warning
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DO NOT PAY CASH TO LORRY TOY", 15, doc.lastAutoTable.finalY + 10);

  // 💸 Charges Breakdown
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 14,
    theme: "grid",
    styles: { fontSize: 9 },
    head: [["Freight", "Risk Ch.", "Sur. Ch.", "Hamali", "Driver", "Service Value", "TOTAL"]],
    body: [[
      payload.freight,
      payload.riskCharge,
      payload.surcharge,
      payload.hamali,
      payload.driverCharge || "",
      payload.serviceValue,
      payload.totalAmount
    ]],
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 26 },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { cellWidth: 26 },
      6: { cellWidth: 26 }
    }
  });

  // 🖋️ Stamp Instruction
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Affix Stamp in Confirmation of Acceptance of Rate Mentioned above", 15, doc.lastAutoTable.finalY + 6);

    // 🖋️ Delivery Acknowledgment
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    theme: "grid",
    styles: { fontSize: 9, minCellHeight: 20 },
    head: [["Delivery Acknowledgment Remarks", "Stamp with Signature", "Date", "Lorry No."]],
    body: [[
      "",
      "",
      payload.deliveryDate,
      payload.lorryNo
    ]],
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 }
    }
  });

  // 🖋️ Signature Panel (AL / Name / Signature / Code)
  const sigY = doc.lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text("AL", 15, sigY);
  doc.text("Name", 50, sigY);
  doc.text("Signature", 110, sigY);
  doc.text("Code", 170, sigY);

  // Signature lines
  doc.setDrawColor(150);
  doc.setLineWidth(0.2);
  doc.line(25, sigY + 2, 45, sigY + 2);   // AL line
  doc.line(60, sigY + 2, 100, sigY + 2);  // Name line
  doc.line(120, sigY + 2, 160, sigY + 2); // Signature line
  doc.line(180, sigY + 2, 195, sigY + 2); // Code line

  // Save PDF
  doc.save(`${cn}-Consignment-Note.pdf`);
}