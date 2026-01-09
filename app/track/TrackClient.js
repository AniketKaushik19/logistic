"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ConsignmentTable from "../_components/ConsignmentTable";
import { generatePDF } from "@/utils/generatePDF";
import { motion } from "framer-motion";
import { Search, FileDown, PackageSearch } from "lucide-react";
import { printPDF } from "@/utils/printPDF";
export default function TrackClient() {
  const [cn, setCn] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch consignment
  const track = async (value) => {
    const query = String(value ?? "").trim();
    if (!query) {
      setError("Please enter a consignment number");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(query)}`, {
        cache: "no-store",
        credentials: "include",
      });
        if (!res.ok) {
      throw new Error("API failed");
    }
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        setError(json?.message || "Consignment not found");
      } else {
        setData(json);
      }
    } catch {
      setError("Consignment not Found");
    } finally {
      setLoading(false);
    }
  };

  // Auto-track from URL
  useEffect(() => {
    const q = searchParams.get("cn");
    if (q) {
      setCn(q);
      track(q);
    }
  }, [searchParams]);

  return (
    <div className="pt-24 px-4 bg-white min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-800 flex justify-center items-center gap-2">
          <PackageSearch className="w-7 h-7 text-indigo-600" />
          Track Consignment
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter your consignment number to view details
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-xl mx-auto flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            className="w-full pl-9 pr-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Enter consignment number"
            value={cn}
            onChange={(e) => setCn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && cn.trim()) {
                router.push(`/track?cn=${encodeURIComponent(cn.trim())}`);
              }
            }}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() =>
            cn.trim() &&
            router.push(`/track?cn=${encodeURIComponent(cn.trim())}`)
          }
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? (
            "Searching…"
          ) : (
            <>
              <Search size={16} /> Track
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-red-600"
        >
          {error}
        </motion.div>
      )}

      {/* Result Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-10"
      >
        <ConsignmentTable data={data} />
      </motion.div>

      {/* PDF Button */}
      {data?.consignment && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => await printPDF(cn, data.consignment)}
            className="flex items-center gap-2 bg-linear-to-br from-indigo-600 to-blue-600
                   text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg
                   hover:from-indigo-700 hover:to-blue-700 my-5"
          >
            <FileDown size={18} />
            Print PDF
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
