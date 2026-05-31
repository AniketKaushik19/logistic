"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import Navbar from "@/app/_components/Navbar";
import { useRouter } from "next/navigation";

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
  Upload,
} from "lucide-react";
import { printPDF } from "@/utils/printPDF";
import ConfirmToast from "@/app/components/ConfirmToast";
import ProfitModal from "@/app/_components/profitModal";
import { error } from "pdf-lib";

const LOAD_COUNT = 6;

export default function ConsignmentList() {
  const [items, setItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(LOAD_COUNT);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [excelPanelOpen, setExcelPanelOpen] = useState(false);
  const [excelScope, setExcelScope] = useState("all");
  const [excelYear, setExcelYear] = useState(new Date().getFullYear().toString());
  const [excelMonth, setExcelMonth] = useState("1");

  const router = useRouter();

  const fetchItems = async () => {
    setPageLoading(true);
    try {
   
      const res = await fetch("/api/consignment", {
        cache: "no-store",
         headers: {
          "Content-Type": "application/json",
          },
      });
      const data = await res.json();
      setItems(data);
    } catch (error) {
      toast.error("Failed to load consignments");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedConsignment && !selectedConsignment._id) {
      setShowProfitModal(false);
      toast.error("Consignment data is not ready");
    }
  }, [selectedConsignment]);

  /* ================= DELETE ================= */
  const availableYears = useMemo(() => {
    const years = new Set();
    items.forEach((c) => {
      const date = c.createdAt ? new Date(c.createdAt) : null;
      if (date instanceof Date && !isNaN(date)) {
        years.add(date.getFullYear());
      }
    });
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [items]);

  const excelFilteredItems = useMemo(() => {
    if (excelScope === "all") return items;
    return items.filter((c) => {
      const date = c.createdAt ? new Date(c.createdAt) : null;
      if (!(date instanceof Date) || isNaN(date)) return false;
      const yearMatch = date.getFullYear().toString() === excelYear;
      if (!yearMatch) return false;
      if (excelScope === "year") return true;
      return date.getMonth() + 1 === Number(excelMonth);
    });
  }, [items, excelScope, excelYear, excelMonth]);

  const formatCreatedAt = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getExcelScopeLabel = () => {
    if (excelScope === "all") return "All Time";
    if (excelScope === "year") return `Year ${excelYear}`;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = Number(excelMonth) - 1;
    return `${monthNames[monthIndex] || excelMonth} ${excelYear}`;
  };

  const downloadConsignmentExcel = () => {
    if (!excelFilteredItems || excelFilteredItems.length === 0) {
      toast.error("No consignments found for the selected period.");
      return;
    }

    const headers = [
      "Consignment Number",
      "Consignee Name",
      "Consignor Name",
      "Created At",
      "Amount",
      "Expenses",
      "Profit",
    ];

    const rows = excelFilteredItems.map((c) => [
      c.cn || "",
      c.consigneeName || "",
      c.consignorName || "",
      formatCreatedAt(c.createdAt),
      c.amount ?? c.Amount ?? "",
      c.expenses ?? "",
      c.profit?.amount ?? "",
    ]);

    const escapeHtml = (value) => {
      const text = value == null ? "" : String(value);
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    const htmlRows = rows
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td style="border: 1px solid #ccc; padding: 6px;">${escapeHtml(cell)}</td>`)
            .join("")}</tr>`
      )
      .join("");

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <style>
            table { border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>
          <table>
            <tr>
              <td colspan="7" style="font-size:44px; font-weight:bold; text-align:center; padding:12px;">BOOKINGS</td>
            </tr>
            <tr>
              <td colspan="7" style="font-size:34px; font-weight:bold; text-align:center; padding:8px;">${escapeHtml(getExcelScopeLabel())}</td>
            </tr>
            <tr><td colspan="7" style="height:12px;"></td></tr>
            <tr>${headers
              .map((header) => `<th>${escapeHtml(header)}</th>`)
              .join("")}</tr>
            ${htmlRows}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const label = excelScope === "all" ? "all" : excelScope === "year" ? `year_${excelYear}` : `month_${excelYear}_${excelMonth}`;
    link.download = `consignments_${label}_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Excel download ready");
  };

  const handleDelete = async (consignmentNumber) => {
    const confirmed = await ConfirmToast({
      msg: "Are you sure. You want to delete this consignment?",
    });
    if (!confirmed) return;

    setActionLoadingId(consignmentNumber);
    try {
      const res = await fetch(`/api/consignment`, {
        method: "DELETE",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({ consignmentNumber }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success("Consignment deleted successfully");
      }
      fetchItems();
    } catch (error) {
      console.error("Error deleting Consignment:", error);
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

            <div className="flex gap-5 flex-wrap">
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

              <button
                type="button"
                onClick={() => setExcelPanelOpen((prev) => !prev)}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg shadow hover:bg-emerald-700 flex items-center gap-2"
              >
                <ArrowDownCircle />
                Bookings
              </button>
            </div>         
          </div>

          {/* Summary */}
          <div className="bg-white flex flex-col md:flex-row items-center justify-between rounded-lg p-4 shadow-sm mb-6">
   <div>
 <p className="text-sm text-slate-500">Total Consignments</p>
            <h2 className="text-2xl font-bold flex gap-2">
              <PackageCheck />
              {items.length}
            </h2>
            </div>

            <div>
                 {excelPanelOpen && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm max-w-3xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Scope</label>
                      <select
                        value={excelScope}
                        onChange={(e) => setExcelScope(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="all">All Time</option>
                        <option value="month">Specific Month</option>
                        <option value="year">Complete Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">Year</label>
                      <select
                        value={excelYear}
                        onChange={(e) => setExcelYear(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        {availableYears.map((year) => (
                          <option key={year} value={String(year)}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={`${excelScope === "month" ? "block" : "hidden"}`}>
                      <label className="block text-sm font-medium text-slate-700">Month</label>
                      <select
                        value={excelMonth}
                        onChange={(e) => setExcelMonth(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={downloadConsignmentExcel}
                      className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
                    >
                      <Upload/>Excel
                    </button>
                    <button
                      type="button"
                      onClick={() => setExcelPanelOpen(false)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                  const cn = c.cn || "—";

                  return (
                    <motion.div
                      key={c._id}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="rounded-xl bg-white border shadow-md hover:shadow-xl transition"
                    >
                      <div className="p-5 relative">
                       <button
  type="button"
  className="absolute top-3 right-3 bg-yellow-500 text-white w-9 h-9 rounded-full flex items-center justify-center"
  onClick={() => router.push(`/consignment?editId=${c._id}`)}
>
  <Pencil size={14} />
</button>
 

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
                            onClick={() => handleDelete(c.cn)}
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
                          {typeof c.profit?.amount === "number" ? (
                            <div
                              className={`px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold
    ${
      c.profit.amount < 0
        ? "bg-red-100 text-red-700"
        : "bg-green-100 text-green-700"
    }`}
                            >
                              <IndianRupee size={14} />
                              {c.profit.amount.toFixed(2)}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (!c._id) {
                                  toast.error("Consignment not loaded yet");
                                  return;
                                }
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
          fetchItems={fetchItems}
          onClose={() => setShowProfitModal(false)}
          onSave={(profitAmount) => {
            setItems((prev) =>
              prev.map((i) =>
                i._id === selectedConsignment._id
                  ? {
                      ...i,
                      profit: {
                        ...(i.profit || {}),
                        amount: profitAmount,
                      },
                    }
                  : i
              )
            );
          }}
        />
      )}
    </>
  );
}
