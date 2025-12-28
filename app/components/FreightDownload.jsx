import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import FreightMemoPDF from "./FreightMemo";
import { useState, useEffect, useRef } from "react";

export default function DownloadFreight({setForm, form, onSave }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setMounted(true);
  }, []);
  const downloadedRef = useRef(false);

  useEffect(() => {
    // 🛑 HARD EXIT — prevents Eo crash
    if (
      !form ||
      !form.total ||
      form.total <= 0 ||
      !form.amountInWords
    ) {
      return;
    }

    if (downloadedRef.current) return;

    downloadedRef.current = true;

    try {
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  }, [form]);

  // 🛑 Do NOT render PDF unless valid
  if (!form || form.total <= 0) return null;

  return mounted && (
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
