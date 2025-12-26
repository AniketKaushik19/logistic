"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { BillPDF } from "./BillPDF";
import { useState ,useEffect } from "react";

export default function DownloadBill({form}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
   {mounted && ( <PDFDownloadLink
      document={<BillPDF bill={form} />}
      fileName="transport-bill.pdf"
      className="px-4 py-2  text-white rounded-lg"
    >
      {({ loading }) =>
        loading ? "Generating PDF..." : "Download Bill PDF"
      }
    </PDFDownloadLink> )
  } 
  </>
  );
}
