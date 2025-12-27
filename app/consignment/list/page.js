"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import Navbar from "@/app/_components/Navbar";
import {
  Plus,
  Calendar,
  Truck,
  User,
  Printer,
  Trash2,
  Pencil,
  PackageCheck,
  ArrowDownCircle,
  Package,
  IndianRupee,
} from "lucide-react";
import { TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { printPDF } from "@/utils/printPDF";
import ConfirmToast from "@/app/components/ConfirmToast";
import { useRouter } from "next/navigation";
import ProfitModal from "@/app/_components/profitModal";

const LOAD_COUNT = 6;

export default function ConsignmentList() {
  const [items, setItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(LOAD_COUNT);
  const router = useRouter();
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);

  /* ================= FETCH ================= */
  const fetchItems = useCallback(async () => {
    setPageLoading(true);
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch("/api/consignment", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) ConfirmToast({ msg: "Failed to Fetch" });

      const json = await res.json();
      const data = Array.isArray(json) ? json : json?.data || [];

      setItems(data);
    } catch {
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
    const confirmed = await ConfirmToast({
      msg: "Are you Sure ? You want to Delete the consignment .",
    });
    if (!confirmed) return;
    setActionLoadingId(id);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/consignment/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ================= PDF ================= */
  const handleDownload = async (item) => {
    setActionLoadingId(item._id);
    try {
      const cn =
        item.cn || item.cnNo || item.consignmentNo || item._id.slice(-6);
      await printPDF(cn, item);
      toast.success("PDF generated");
    } catch {
      toast.error("PDF failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <>
      <Navbar />
      <Toaster />

      <div className="pt-25 px-6 pb-20 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Truck className="w-7 h-7 text-indigo-600" />
              Consignments
            </h1>
            <div className="flex gap-5">
              <Link href="/track">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex hover:cursor-pointer items-center gap-2 bg-red-600 text-white mt-2 md:m-0 px-5 py-2 rounded-lg shadow hover:bg-red-700"
                >
                  <Package />
                  Tracker
                </motion.button>
              </Link>

              <Link href="/consignment">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex hover:cursor-pointer items-center gap-2 bg-indigo-600 text-white mt-2 md:m-0 px-5 py-2 rounded-lg shadow hover:bg-indigo-700"
                >
                  <Plus size={18} />
                  New Consignment
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border-2  rounded-lg p-4 shadow-sm">
              <p className="text-sm text-slate-500">Total Consignments</p>
              <h2 className="text-2xl hover:cursor-pointer font-bold text-slate-800 flex gap-2">
                <PackageCheck />
                {items.length}
              </h2>
            </div>
          </div>

          {/* States */}
          {pageLoading ? (
            <p className="text-center text-gray-500 animate-pulse">
              Loading consignments…
            </p>
          ) : visibleItems.length === 0 ? (
            <p className="text-center text-gray-500">No consignments found</p>
          ) : (
            <>
              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {visibleItems.map((c) => {
                  const cn = c.cn || c.cnNo || c.consignmentNo || "—";

                  return (
                    <motion.div
                      key={String(c._id)}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="relative rounded-xl bg-white border-2 border-white shadow-md hover:shadow-2xl transition"
                    >
                      <div className="p-5">
                        <Link href={`/consignment?editId=${c._id}`}>
                          <button className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-yellow-500 text-white rounded-full shadow  hover:cursor-pointer hover:brightness-90">
                            <Pencil size={14} />
                          </button>
                        </Link>

                        <h3 className="font-bold text-lg text-slate-800">
                          {cn}
                        </h3>

                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString()
                            : "—"}
                        </p>

                        <div className="mt-4 text-sm text-slate-600 space-y-1">
                          <p className="flex gap-2">
                            <User size={14} />
                            <strong>Consignee:</strong> {c.consigneeName || "—"}
                          </p>
                          <p className="flex gap-2">
                            <User size={14} />
                            <strong>Consignor:</strong> {c.consignorName || "—"}
                          </p>
                        </div>

                        <div className="mt-5 flex gap-2 items-center">
                          <button
                            onClick={() => handleDelete(c._id)}
                            disabled={actionLoadingId === c._id}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDownload(c)}
                            disabled={actionLoadingId === c._id}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Printer size={14} />
                          </button>
                          {/* PROFIT */}
                          {typeof c.profit === "number" ? (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md font-semibold text-sm">
                              <IndianRupee size={14} />
                              {c.profit.toFixed(2)}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedConsignment(c);
                                setShowProfitModal(true);
                              }}
                              className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-700"
                            >
                              💵 Profit
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
              </div>

              {/* LOAD MORE */}
              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setVisibleCount((p) => p + LOAD_COUNT)}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl shadow hover:scale-105 transition flex "
                  >
                    <ArrowDownCircle className="h-5 w-5 mr-2" />
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {showProfitModal && selectedConsignment && (
                  <ProfitModal
                    consignment={selectedConsignment}
                    onClose={() => setShowProfitModal(false)}
                    onSave={(profitAmount) => {
                      setItems((prev) =>
                        prev.map((i) =>
                          i._id === selectedConsignment._id
                            ? { ...i, profit: profitAmount }
                            : i
                        )
                      );
                    }}
                  />
                )}
    </>
  );
}
