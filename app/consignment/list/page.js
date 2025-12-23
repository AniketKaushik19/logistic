"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { generatePDF } from "@/utils/generatePDF";
import Navbar from "@/app/_components/Navbar";
import {
  Plus,
  Calendar,
  Truck,
  User,
  Download,
  Trash2,
  Pencil,
} from "lucide-react";

export default function ConsignmentList() {
  const [items, setItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  /* ================= FETCH ================= */
  const fetchItems = useCallback(async () => {
    setPageLoading(true);
    try {
      const res = await fetch("/api/consignment", { cache: "no-store" });

      if (!res.ok) {
        throw new Error("API error");
      }

      const json = await res.json();

      // Support both array and { success, data }
      const data = Array.isArray(json) ? json : json?.data || [];
      setItems(data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load consignments");
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div className="bg-white border rounded shadow-lg p-4 w-72">
            <p className="text-sm font-medium">Delete this consignment?</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-3 py-1 rounded bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    if (!confirmed) return;

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/consignment/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setItems((prev) => prev.filter((i) => String(i._id) !== String(id)));
      toast.success("Consignment deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ================= PDF ================= */
  const handleDownload = async (item) => {
    const id = item._id;
    setActionLoadingId(id);

    try {
      const cn =
        item.cn || item.cnNo || item.consignmentNo || item._id?.slice(-6);

      await generatePDF(cn, item);
      toast.success("PDF generated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <Navbar />
      <div className="pt-25 px-6 pb-20">
        <Toaster />

        <div className="max-w-6xl mx-auto">
  {/* Header */}
  <div className="flex flex-col md:flex-row items-center justify-between mb-8">
    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
      <Truck className="w-7 h-7 text-indigo-600" />
      Consignments
    </h1>

    <Link href="/consignment">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-indigo-600 text-white mt-2 md:m-0 px-5 py-2 rounded-lg shadow hover:bg-indigo-700"
      >
        <Plus size={18} />
        New Consignment
      </motion.button>
    </Link>
  </div>

  {/* States */}
  {pageLoading ? (
    <p className="text-center text-gray-500 animate-pulse">
      Loading consignments…
    </p>
  ) : items.length === 0 ? (
    <p className="text-center text-gray-500">
      No consignments found
    </p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {items.map((c) => {
        const cn =
          c.cn || c.cnNo || c.consignmentNo || "—";

        return (
          <motion.div
            key={String(c._id)}
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition"
          >
            <div className="p-5">
              {/* Top */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {cn}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar size={12} />
                    {c.consignmentDate ||
                      (c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString()
                        : "—")}
                  </p>
                </div>

                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                  {c.status || "Booked"}
                </span>
              </div>

              {/* Details */}
              <div className="mt-4 text-sm text-slate-600 space-y-1">
                <p className="flex items-center gap-2">
                  <User size={14} />
                  <strong>Consignee:</strong>{" "}
                  {c.consigneeName || "—"}
                </p>
                <p className="flex items-center gap-2">
                  <User size={14} />
                  <strong>Consignor:</strong>{" "}
                  {c.consignorName || "—"}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/consignment?editId=${c._id}`}>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                    <Pencil size={14} />
                    Edit
                  </button>
                </Link>

                <button
                  onClick={() => handleDelete(c._id)}
                  disabled={actionLoadingId === c._id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {actionLoadingId === c._id
                    ? "Deleting…"
                    : "Delete"}
                </button>

                <button
                  onClick={() => handleDownload(c)}
                  disabled={actionLoadingId === c._id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Download size={14} />
                  {actionLoadingId === c._id
                    ? "Generating…"
                    : "PDF"}
                </button>

              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  )}
</div>
</div>
    </>
  );
}
