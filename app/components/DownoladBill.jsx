"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import BillPDF from "./BillPDF";
import { useState } from "react";

export default function DownloadBill() {
  const billData = {
     billNo: "LKO/0017",
    date: "18-08-2025",
    party: "M/s MOTORFAB SALES PVT LTD LUCKNOW-19",
    cnNo: "62",
    cnDate: "14-08-2025",
    from: "TM LKO",
    to: "TM LKO",
    amount: "700.00",
    pan: "CPTPK5713K",
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  return (
    <>
   {mounted && ( <PDFDownloadLink
      document={<BillPDF bill={billData} />}
      fileName="transport-bill.pdf"
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      {({ loading }) =>
        loading ? "Generating PDF..." : "Download Bill PDF"
      }
    </PDFDownloadLink> )
  } 
  </>
  );
}
