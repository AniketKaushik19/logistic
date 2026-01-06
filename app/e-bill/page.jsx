"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import { Edit, Trash2, Printer, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { BillPDF } from "../components/BillPDF";
import { pdf } from "@react-pdf/renderer";

export default function EBillsDashboard() {
  const [ebill, setEbill] = useState([]);

  /* ================= PRINT ================= */
  const handlePrint = async (bill) => {
    const blob = await pdf(<BillPDF bill={bill} />).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (win) win.onload = () => win.print();
  };

  /* ================= FETCH ================= */
  const getEbill = async () => {
    try {
      const res = await fetch("/api/e-bill", { cache: "no-store" });
      const json = await res.json();
      setEbill(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      toast.error("Failed to fetch E-bills");
      console.error(err);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (_id) => {
    try {
      const res = await fetch("/api/e-bill", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success("E-Bill deleted successfully");
      getEbill();
    } catch (err) {
      toast.error("Failed to delete E-Bill");
      console.error(err);
    }
  };

  useEffect(() => {
    getEbill();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-100 p-6 mt-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            E-Bills Dashboard
          </h1>
          <Link href="/e-bill/addE-bill">
            <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-semibold shadow-lg hover:shadow-2xl transition">
              <Plus className="size-4" />
             E-Bill
            </button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebill.length === 0 ? (
            <div className="col-span-full text-center text-slate-500">
              No E-Bills found
            </div>
          ) : (
            ebill.map((b, i) => (
              <div
                key={i}
                className="relative rounded-2xl bg-white p-5 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {b.customer}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Bill No: <span className="font-medium">{b.billNo}</span>
                    </p>
                    <p className="text-xs text-slate-400">Date: {b.billDate}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Grand Total</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      ₹ {b.grandTotal}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Address:</span>{" "}
                    {b.customerAddress}
                  </p>

                  {/* Consignments */}
                  <div className="space-y-1">
                    {b.consignments?.map((c, j) => (
                      <div
                        key={j}
                        className="flex justify-between items-center rounded-xl bg-slate-50 px-3 py-2 shadow-sm hover:shadow-md transition"
                      >
                        <span className="text-slate-700">{c.from} → {c.to}</span>
                        <span className="text-slate-500 font-mono">{c.cn || `#${j + 1}`}</span>
                        <span className="text-indigo-600 font-semibold">₹ {c.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                  <Link href={`/e-bill/editE-bill/${b._id}`}>
                    <button
                      className="rounded-xl bg-amber-100 text-amber-700 px-3 py-2 hover:bg-amber-200 transition flex items-center gap-1"
                      title="Edit"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={() => handlePrint(b)}
                    className="rounded-xl bg-blue-100 text-blue-700 px-3 py-2 hover:bg-blue-200 transition flex items-center gap-1"
                    title="Print"
                  >
                    <Printer size={16} />
                    Print
                  </button>

                  <button
                    onClick={() => handleDelete(b._id)}
                    className="rounded-xl bg-red-100 text-red-700 px-3 py-2 hover:bg-red-200 transition flex items-center gap-1"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
