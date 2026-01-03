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
  doc.addImage(base64, "PNG", 12, 10, 18, 18);
}

/* ================= CHECKBOX ================= */
function checkbox(doc, x, y, checked) {
  doc.rect(x, y, 4, 4);
}

/* ================= GENERATE PDF ================= */
export async function generatePDF(cn, payload) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoBase64 = await getBase64FromPublicImage("/logo.png");

    // helper to draw one copy with a custom label
    function drawCopy(label) {
      addLogo(doc, logoBase64);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(200, 0, 0);
      doc.text("ANIKET LOGISTIC", pageWidth / 2 + 5, 20, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(0);

      doc.text("7A, Buddh Vihar Colony Kotwali Road,", 15, 30);
      doc.text("Chinhat, Lucknow - 226028", 15, 35);
      doc.text("Mob.: 7388533786", 15, 40);

      doc.text(`CONSIGNMENT NOTE No.: ${payload.cn || cn || ""}`, pageWidth - 15, 30, { align: "right" });
      doc.text("PAN No.: CKTPK5713K", pageWidth - 15, 35, { align: "right" });
      doc.text(`Date: ${payload.consignmentDate || ""}`, pageWidth - 15, 40, { align: "right" });
      doc.text(label, pageWidth - 15, 45, { align: "right" });

      /* OPTIONS */
      doc.setFont("helvetica", "bold");
      doc.text("AT OWNER'S RISK", 15, 52);

      doc.setFont("helvetica", "normal");
      doc.text("DOOR DELIVERY", pageWidth - 80, 52);
      checkbox(doc, pageWidth - 45, 49, payload.doorDelivery === "YES");
      doc.text("YES", pageWidth - 38, 52);
      checkbox(doc, pageWidth - 25, 49, payload.doorDelivery === "NO");
      doc.text("NO", pageWidth - 18, 52);

        /* CONSIGNOR / TAX */
      autoTable(doc, {
                startY: 58,
        theme: "grid",
        styles: { fontSize: 9, fontStyle: "bold" },
        body: [[
          `Consignor's Name & Address\n${payload.consignorName || ""}\n${payload.consignorAddress || ""}`,
          `Consignor C.S.T. No\n ${payload.consignorCSTNo || ""}`,
          `Consignee C.S.T. No\n${payload.consigneeCSTNo || ""}`,
          `Sales Tax / Permit / Declaration\nApplicable as per rule`,
          `Valid up to\n ${payload.validUpTo || ""}`,
          `Date\n ${payload.declarationDate || ""}`
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

      /* PAYMENT CONTROL */
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        theme: "grid",
        styles: { fontSize: 9, fontStyle: "bold" },
        body: [[`CONTROL WILL BE PAID BY CONSIGNOR CONSIGNEE`]]
      });
        /* CONSIGNEE */
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        theme: "grid",
        styles: { fontSize: 9, fontStyle: "bold" },
        body: [[
          `Consignee's Name & Address\n${payload.consigneeName || ""}\n${payload.consigneeAddress || ""}`,
          `Delivery Address\n${payload.deliveryAddress || ""}`
        ]],
        columnStyles: { 0: { cellWidth: 95 }, 1: { cellWidth: 95 } }
      });

        /* DEMURRAGE */
      const demY = doc.lastAutoTable.finalY + 6;
      doc.setFont("helvetica", "bold");
      doc.text("SCHEDULE OF DEMURRAGE CHARGES", pageWidth / 2, demY, { align: "center" });

      autoTable(doc, {
        startY: demY + 2,
        theme: "grid",
        styles: { fontSize: 9, fontStyle: "bold" },
        body: [
          ["DOOR DELIVERY RATES", "UNLOADING WILL BE EXTRA"],
          ["Drum / Cartons / Packages", "Labour Charges As Applicable"],
          ["Demurrage After Free Time", "Oil / Weight Charges Extra"]
        ],
        columnStyles: { 0: { cellWidth: 95 }, 1: { cellWidth: 95 } }
      });

      /* ROUTE */
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 4,
        theme: "grid",
        styles: { fontSize: 9, fontStyle: "bold" },
        body: [[
          `Phone\n${payload.consignorPhone || ""}`,
          "Fax\n—",
          `From\n${payload.fromLocation || ""}`,
          `To\n${payload.toLocation || ""}`
        ]],
        columnStyles: { 0: { cellWidth: 48 }, 1: { cellWidth: 48 }, 2: { cellWidth: 48 }, 3: { cellWidth: 48 } }
      });

      /* GOODS */
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        theme: "grid",
        head: [["Packages", "Method", "Description (Said to Contain)"]],
        body: [[payload.packageCount || "", payload.packageMethod || "", payload.goodsDescription || ""]]
      });

      /* INVOICE */
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        theme: "grid",
        styles: { fontSize: 9, fontStyle: "bold" },
        body: [[
          `Invoice No\n${payload.invoiceNo || ""}`,
          `Rate / Kg\n${payload.rateperkg || "Fixed"}`,
          `Measurement\n${payload.measurement || ""}`,
          `Payment Type\n${payload.paymentType || ""}`,
          `Invoice Value\n${payload.invoiceValue || ""}`
        ]]
      });

      /* WEIGHT */
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        theme: "grid",
        styles: { fontSize: 9, fontStyle: "bold" },
        body: [[
          `Weight (Actual)\n${payload.weightActual || "Fixed"}`,
          `Weight (Charged)\n${payload.weightCharged || "Fixed"}`,
          `Freight\n${payload.freight || ""}`,
          `Billed at\n${payload.billedAt || ""}`,
          `Paid at\n${payload.paidAt || ""}`
        ]]
      });

      /* WARNING */
      doc.setFont("helvetica", "bold");
      doc.text("DO NOT PAY CASH TO LORRY DRIVER", 15, doc.lastAutoTable.finalY + 10);

      /* CHARGES */
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        theme: "grid",
        styles: { fontSize: 9, fontStyle: "bold" },
        head: [["Freight", "Risk Charges", "Surcharge", "Hamali Charges", "Service Charges", "TOTAL"]],
        body: [[payload.freight || "", payload.riskCharge || "", payload.surcharge || "", payload.hamali || "", payload.serviceCharge || "", payload.amount || ""]]
      });

      /* DELIVERY ACK */
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        theme: "grid",
        styles: { fontSize: 9, fontStyle: "bold" },
        head: [["Delivery Remarks", "Stamp & Signature", "Date", "Lorry No", "Driver"]],
        body: [[payload.deliveryRemarks || "", "", payload.deliveryDate || "", payload.vehicleNo || "", payload.driverName || ""]]
      });

      /* SIGNATURE */
     /* SIGNATURE */
const sigY = doc.lastAutoTable.finalY + 15;

doc.setFont("helvetica", "bold");

// Labels
doc.text("Name", 60, sigY);
doc.text("Signature", 120, sigY);
doc.text("Code", 175, sigY);

// Name value (above line)
doc.setFont("helvetica", "normal");
doc.text(payload.yourName || "", 60, sigY + 4);

// Lines
doc.setLineWidth(0.5);
doc.line(60, sigY + 6, 110, sigY + 6);
doc.line(120, sigY + 6, 170, sigY + 6);
doc.line(175, sigY + 6, 205, sigY + 6);

    }

    // draw two copies: Consignee and Lorry
    drawCopy("CONSIGNEE COPY");
    doc.addPage();
    drawCopy("LORRY COPY");

    return doc.output("blob");
}
