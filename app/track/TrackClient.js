"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ConsignmentTable from "../_components/ConsignmentTable";
import { generatePDF } from "@/utils/generatePDF";
import { motion } from "framer-motion";
import { Search, FileDown, PackageSearch, FileText, Receipt, Truck, IndianRupee } from "lucide-react";
import { printPDF } from "@/utils/printPDF";
import FreightMemoPDF from "@/app/components/FreightMemo";
import { BillPDF } from "@/app/components/BillPDF";
import { pdf } from "@react-pdf/renderer";

export default function TrackClient() {
  const [trackType, setTrackType] = useState("consignment");
  const [cn, setCn] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch tracking data
  const track = async (value, typeToTrack = trackType) => {
    const query = String(value ?? "").trim();
    if (!query) {
      setError(`Please enter a ${typeToTrack === "consignment" ? "consignment" : typeToTrack === "freight" ? "challan" : "bill"} number`);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(query)}?type=${typeToTrack}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("API failed");
      }
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        setError(json?.message || `${typeToTrack === "consignment" ? "Consignment" : typeToTrack === "freight" ? "Freight Memo" : "E-Bill"} not found`);
      } else {
        setData(json);
      }
    } catch {
      setError(`${typeToTrack === "consignment" ? "Consignment" : typeToTrack === "freight" ? "Freight Memo" : "E-Bill"} not Found`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-track from URL
  useEffect(() => {
    const q = searchParams.get("cn");
    const t = searchParams.get("type") || "consignment";
    if (q) {
      setCn(q);
      setTrackType(t);
      track(q, t);
    }
  }, [searchParams]);

  // Handle PDF Print
  const handlePrintPDF = async () => {
    if (trackType === "consignment" && data?.consignment) {
      await printPDF(cn, data.consignment);
    } else if (trackType === "freight" && data?.freight) {
      const blob = await pdf(<FreightMemoPDF data={data.freight} />).toBlob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url);
      if (win) win.onload = () => win.print();
    } else if (trackType === "ebill" && data?.ebill) {
      const blob = await pdf(<BillPDF bill={data.ebill} />).toBlob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url);
      if (win) win.onload = () => win.print();
    }
  };

  return (
    <div className="pt-24 px-4 bg-white min-h-screen pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-800 flex justify-center items-center gap-2">
          <PackageSearch className="w-7 h-7 text-indigo-600" />
          Track & View Info
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Select tracking category and search to view instant records
        </p>
      </motion.div>

      {/* Premium Radio Selection Toggles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="max-w-xl mx-auto mb-8"
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "consignment", label: "Consignment", icon: <Truck className="w-4 h-4" /> },
            { id: "freight", label: "Freight Memo", icon: <FileText className="w-4 h-4" /> },
            { id: "ebill", label: "E-Bill", icon: <Receipt className="w-4 h-4" /> },
          ].map((type) => (
            <label
              key={type.id}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer text-center sm:text-left ${
                trackType === type.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="trackType"
                value={type.id}
                checked={trackType === type.id}
                onChange={() => {
                  setTrackType(type.id);
                  setCn("");
                  setData(null);
                  setError(null);
                  router.push(`/track`);
                }}
                className="sr-only"
              />
              {type.icon}
              <span>{type.label}</span>
            </label>
          ))}
        </div>
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
            className="w-full pl-9 pr-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder={
              trackType === "consignment"
                ? "Enter consignment number (e.g. ALC-1001)"
                : trackType === "freight"
                ? "Enter challan number (e.g. CH-1002)"
                : "Enter bill number (e.g. BL-0001)"
            }
            value={cn}
            onChange={(e) => setCn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && cn.trim()) {
                router.push(`/track?cn=${encodeURIComponent(cn.trim())}&type=${trackType}`);
              }
            }}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() =>
            cn.trim() &&
            router.push(`/track?cn=${encodeURIComponent(cn.trim())}&type=${trackType}`)
          }
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 hover:cursor-pointer"
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
          className="mt-6 text-center text-red-600 font-medium"
        >
          {error}
        </motion.div>
      )}

      {/* Results Rendering */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-10"
      >
        {/* Consignment Details */}
        {trackType === "consignment" && data?.consignment && (
          <ConsignmentTable data={data} />
        )}

        {/* Freight Memo Details */}
        {trackType === "freight" && data?.freight && (
          <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8 border border-gray-200 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold">Freight Memo Details</span>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">Challan No: {data.freight.challanNo}</h2>
              </div>
              <div className="flex flex-col items-end mt-2 sm:mt-0">
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                  data.freight.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {data.freight.status === "Paid" && data.freight.paidAt
                    ? `Paid on ${new Date(data.freight.paidAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}`
                    : (data.freight.status || "Pending")
                  }
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-xs text-gray-500 font-medium uppercase">Date</span>
                <span className="text-sm font-semibold text-gray-800">{data.freight.date || "-"}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium uppercase">From</span>
                <span className="text-sm font-semibold text-gray-800">{data.freight.from || "-"}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium uppercase">To</span>
                <span className="text-sm font-semibold text-gray-800">{data.freight.to || "-"}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium uppercase">Lorry No</span>
                <span className="text-sm font-semibold text-gray-800">{data.freight.lorryNo || "-"}</span>
              </div>
            </div>

            {/* GR Nos */}
            <div className="border-b pb-4">
              <span className="block text-xs text-gray-500 font-semibold uppercase mb-2">GR / Consignment Numbers</span>
              <div className="flex flex-wrap gap-2">
                {data.freight.grNos?.map((gr, idx) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-lg border border-indigo-100">
                    {gr}
                  </span>
                ))}
              </div>
            </div>

            {/* Goods Info */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <span className="block text-xs text-gray-500 font-medium uppercase">No. of Packages</span>
                <span className="text-base font-semibold text-gray-800">{data.freight.packages || "-"}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium uppercase">Weight</span>
                <span className="text-base font-semibold text-gray-800">{data.freight.weight || "-"}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium uppercase">Rate</span>
                <span className="text-base font-semibold text-gray-800">
                  {data.freight.rate === "Fixed" || data.freight.rate === "fixed" ? "Fixed" : `₹${data.freight.rate || "-"}`}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-3 gap-6 border-t pt-6 bg-indigo-50/20 p-4 rounded-xl border border-indigo-50">
              <div>
                <span className="block text-xs text-gray-500 font-medium uppercase">Total Lorry Hire</span>
                <span className="text-lg font-bold text-gray-800">₹{data.freight.total || "0"}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 font-medium uppercase">Advance Paid</span>
                <span className="text-lg font-bold text-gray-800">₹{data.freight.advance || "0"}</span>
              </div>
              <div>
                <span className="block text-xs text-indigo-600 font-semibold uppercase">Net Balance</span>
                <span className="text-lg font-bold text-indigo-700 block">
                  {data.freight.status === "Paid"
                    ? `Paid on ${data.freight.paidAt ? new Date(data.freight.paidAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      }) : ""}`
                    : `₹${data.freight.netBalance || "0"}`
                  }
                </span>
              </div>
            </div>

            {/* Word Representation */}
            {data.freight.amountInWords && (
              <div className="text-xs italic text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-100">
                Amount in Words: {data.freight.amountInWords} Only
              </div>
            )}

            {/* Vehicle & Driver Details */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Driver & Owner Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <p className="flex justify-between border-b pb-1">
                    <span className="text-gray-500 font-medium">Driver's Name</span>
                    <span className="font-semibold text-gray-800">{data.freight.driverName || "-"}</span>
                  </p>
                  <p className="flex justify-between border-b pb-1">
                    <span className="text-gray-500 font-medium">Driver Licence No</span>
                    <span className="font-semibold text-gray-800">{data.freight.licenceNo || "-"}</span>
                  </p>
                  <p className="flex justify-between border-b pb-1">
                    <span className="text-gray-500 font-medium">Engine No</span>
                    <span className="font-semibold text-gray-800">{data.freight.engineNo || "-"}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex justify-between border-b pb-1">
                    <span className="text-gray-500 font-medium">Owner's Name</span>
                    <span className="font-semibold text-gray-800">{data.freight.ownerName || "-"}</span>
                  </p>
                  <p className="flex justify-between border-b pb-1">
                    <span className="text-gray-500 font-medium">Chassis No</span>
                    <span className="font-semibold text-gray-800">{data.freight.chassisNo || "-"}</span>
                  </p>
                  <p className="flex justify-between border-b pb-1">
                    <span className="text-gray-500 font-medium">Through</span>
                    <span className="font-semibold text-gray-800">{data.freight.through || "-"}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* E-Bill Details */}
        {trackType === "ebill" && data?.ebill && (
          <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8 border border-gray-200 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold">E-Bill Details</span>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">Bill No: {data.ebill.billNo}</h2>
              </div>
              <div className="text-left sm:text-right mt-2 sm:mt-0">
                <span className="block text-xs text-gray-500 font-medium">Bill Date</span>
                <span className="text-sm font-semibold text-gray-800">{data.ebill.billDate || "-"}</span>
              </div>
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <span className="block text-xs text-gray-500 font-bold uppercase">Customer Details</span>
                <span className="block font-bold text-gray-800 text-base">{data.ebill.customer}</span>
                <span className="block text-xs text-gray-600 leading-relaxed mt-1">{data.ebill.customerAddress}</span>
              </div>
              <div className="space-y-2 md:text-right md:flex md:flex-col md:items-end">
                <div>
                  <span className="block text-xs text-gray-500 font-bold uppercase">Customer GSTIN</span>
                  <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-3 py-1 rounded border border-indigo-100 mt-1">
                    {data.ebill.customerGstin || "-"}
                  </span>
                </div>
                <div className="flex gap-4 mt-2">
                  <div>
                    <span className="block text-xs text-gray-500">Party Code</span>
                    <span className="text-sm font-semibold text-gray-800">{data.ebill.partyCode || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Vendor Code</span>
                    <span className="text-sm font-semibold text-gray-800">{data.ebill.vendorCode || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consignments Included Table */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Consignments Included</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-gray-700 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">S.N</th>
                      <th className="px-4 py-3 text-left font-semibold">CN No</th>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Route</th>
                      <th className="px-4 py-3 text-right font-semibold">Freight</th>
                      <th className="px-4 py-3 text-right font-semibold">Labour</th>
                      <th className="px-4 py-3 text-right font-semibold">Detention</th>
                      <th className="px-4 py-3 text-right font-semibold">Bonus</th>
                      <th className="px-4 py-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.ebill.consignments?.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{c.cnNo}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.cnDate}</td>
                        <td className="px-4 py-3 text-gray-600">{c.from} → {c.to}</td>
                        <td className="px-4 py-3 text-right text-gray-800">₹{c.freight || "0"}</td>
                        <td className="px-4 py-3 text-right text-gray-800">₹{c.labour || "0"}</td>
                        <td className="px-4 py-3 text-right text-gray-800">₹{c.detention || "0"}</td>
                        <td className="px-4 py-3 text-right text-gray-800">₹{c.bonus || "0"}</td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-700">₹{c.total || "0"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bill Summary totals */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-end sm:items-center bg-indigo-50/20 p-5 rounded-xl border border-indigo-50">
              <div className="text-left w-full sm:w-2/3 mb-4 sm:mb-0">
                <span className="block text-xs text-gray-500 font-bold uppercase">Amount in Words</span>
                <span className="text-sm font-semibold italic text-gray-700">{data.ebill.amountInWord} Only</span>
              </div>
              <div className="text-right w-full sm:w-1/3">
                <span className="block text-xs text-gray-500 font-bold uppercase">Grand Total</span>
                <span className="text-2xl font-black text-indigo-700">₹{data.ebill.grandTotal}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* PDF Button */}
      {((trackType === "consignment" && data?.consignment) ||
        (trackType === "freight" && data?.freight) ||
        (trackType === "ebill" && data?.ebill)) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrintPDF}
            className="flex items-center gap-2 bg-linear-to-br from-indigo-600 to-blue-600
                   text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg
                   hover:from-indigo-700 hover:to-blue-700 my-5 hover:cursor-pointer"
          >
            <FileDown size={18} />
            Print PDF
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
