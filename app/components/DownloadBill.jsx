"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { BillPDF } from "./BillPDF";
import { useState ,useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        loading ? "Generating PDF..." : <Button
                    size="icon"
                    className="bg-blue-500 text-white h-9 w-9 rounded-full shadow hover:scale-105 transition"
                    variant="outline"
                  >
                    <Printer size={18} />
                  </Button>
      }
    </PDFDownloadLink> )
  } 
  </>
  );
}
