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
import { printPDF } from "@/utils/printPDF";
import ConfirmToast from "@/app/components/ConfirmToast";
import ProfitModal from "@/app/_components/profitModal";

const LOAD_COUNT = 6;

export default function ConsignmentList() {
  const [items, setItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(LOAD_COUNT);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);

  /* ================= FETCH PROFITS ================= */
  const loadProfits = async (consignments) => {
    const token = localStorage.getItem("auth_token");

    const updated = await Promise.all(
      consignments.map(async (c) => {
        try {
          const res = await fetch(`/api/consignment/${c._id}/profit`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) return c;

          const data = await res.json();
          return { ...c, profit: data.profit };
        } catch {
          return c;
        }
      })
    );

    setItems(updated);
  };

  /* ================= FETCH CONSIGNMENTS ================= */
  const fetchItems = useCallback(async () => {
    setPageLoading(true);
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch("/api/consignment", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) throw new Error();

      const json = await res.json();
      const data = Array.isArray(json) ? json : [];

      setItems(data);
      await loadProfits(data);
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
      msg: "Are you sure. You want to delete this consignment?",
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
      const cn = item.cn || item._id.slice(-6);
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
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-2">
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Truck className="w-7 h-7 text-indigo-600" />
              Consignments
            </h1>

            <div className="flex gap-5">
              <Link href="/track">
                <button className="bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700 flex items-center gap-2">
                  <Package />
                  Tracker
                </button>
              </Link>

              <Link href="/consignment">
                <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 flex items-center gap-2">
                  <Plus size={18} />
                  New Consignment
                </button>
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border-2 rounded-lg p-4 shadow-sm mb-6 w-[30vw]">
            <p className="text-sm text-slate-500">Total Consignments</p>
            <h2 className="text-2xl font-bold flex gap-2">
              <PackageCheck />
              {items.length}
            </h2>
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
                  const cn = c.cn || "—";

                  return (
                    <motion.div
                      key={c._id}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="rounded-xl bg-white border shadow-md hover:shadow-xl transition"
                    >
                      <div className="p-5 relative">
                        <Link href={`/consignment?editId=${c._id}`}>
                          <button className="absolute top-3 right-3 bg-yellow-500 text-white w-9 h-9 rounded-full flex items-center justify-center">
                            <Pencil size={14} />
                          </button>
                        </Link>

                        <h3 className="font-bold text-lg">{cn}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>

                        <div className="mt-4 text-sm space-y-1">
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
                            className="bg-red-600 text-white px-3 py-1.5 rounded-md"
                          >
                            <Trash2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDownload(c)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md"
                          >
                            <Printer size={14} />
                          </button>

                          {/* PROFIT */}
                          {typeof c.profit === "number" ? (
                            <div
                              className={`px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold
      ${
        c.profit < 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
      }`}
                            >
                              <IndianRupee size={14} />
                              {c.profit.toFixed(2)}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedConsignment(c);
                                setShowProfitModal(true);
                              }}
                              className="bg-green-500 text-white px-3 py-1.5 rounded-md"
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

              {/* Load More */}
              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setVisibleCount((p) => p + LOAD_COUNT)}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 mx-auto"
                  >
                    <ArrowDownCircle />
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* PROFIT MODAL */}
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
