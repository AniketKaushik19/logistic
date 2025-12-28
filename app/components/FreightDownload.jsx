import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import FreightMemoPDF from "./FreightMemo";
import { useState, useEffect } from "react";

export default function DownloadFreight({ form ,onSave }) {
   const [mounted, setMounted] = useState(false);
    const [loading ,setLoading]=useState(false)
     useEffect(() => {
       setMounted(true);
     }, []);

  return mounted &&  (
    <div className="flex gap-3">
      {/* DOWNLOAD */}
      <PDFDownloadLink
        document={<FreightMemoPDF data={form} />}
        fileName={`CH-${form.challanNo}`}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {({ loading }) => loading ? "Preparing..." : "Download PDF"}
      </PDFDownloadLink>

      {/* PRINT */}
      <PDFViewer className="hidden print:block w-full h-screen">
        <FreightMemoPDF data={form} />
      </PDFViewer>
    </div>
  );
}
