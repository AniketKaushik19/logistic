"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { generateSalaryPDF } from "@/utils/generateSalaryPDF";
import { PrinterIcon } from "lucide-react";

export default function SalaryHistoryModal({ driver }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== FILTER STATES ===== */
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ===== FETCH HISTORY ===== */
  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/driver/salary/history?driverId=${driver._id}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      toast.error("Failed to load salary history");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (driver) loadHistory();
  }, [driver]);

  /* ===== YEARS & MONTHS ===== */
  const years = useMemo(() => {
    return Array.from(
      new Set(history.map((h) => h.month?.split("-")[0]).filter(Boolean))
    );
  }, [history]);

  const months = useMemo(() => {
    return Array.from(
      new Set(
        history
          .filter((h) => year === "all" || h.month?.startsWith(year))
          .map((h) => h.month?.split("-")[1])
          .filter(Boolean)
      )
    );
  }, [history, year]);

  /* ===== FILTERED DATA ===== */
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (!item.month) return false;

      const [y, m] = item.month.split("-");
      const created = new Date(item.createdAt);

      if (year !== "all" && y !== year) return false;
      if (month !== "all" && m !== month) return false;
      if (fromDate && created < new Date(fromDate)) return false;
      if (toDate && created > new Date(toDate)) return false;

      return true;
    });
  }, [history, year, month, fromDate, toDate]);

  /* ===== NET PAY ===== */
  const netPay = (item) => {
    if (item.markPaid)
      return (
        Number(item.bonus || 0) -
        Number(item.advance || 0) -
        Number(item.penalty || 0)
      );

    return (
      Number(item.baseSalary || 0) +
      Number(item.bonus || 0) -
      Number(item.advance || 0) -
      Number(item.penalty || 0)
    );
  };

  return (
    <DialogContent className="sm:max-w-[780px] bg-white p-5">
      <h3 className="text-lg font-semibold mb-4">
        Salary History – {driver.name}
      </h3>

      {/* ===== FILTER BAR ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All Months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border rounded px-2 py-1"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* ===== CONTENT ===== */}
      {loading ? (
        <div>Loading...</div>
      ) : filteredHistory.length === 0 ? (
        <p className="text-sm text-slate-500">No salary history found</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredHistory.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-slate-50 p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{item.month}</span>

                <div className="flex gap-2 items-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.markPaid
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.markPaid ? "Paid" : "Unpaid"}
                  </span>

                  <button
                  className="hover:cursor-pointer"
                    onClick={() =>
                      generateSalaryPDF({
                        month: item.month,
                        driverName: driver.name,
                        status: item.markPaid ? "Paid" : "Unpaid",
                        baseSalary: item.baseSalary,
                        advance: item.advance,
                        bonus: item.bonus,
                        penalty: item.penalty,
                        paidAt: item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-",
                      })
                    }
                  >
                    <PrinterIcon/>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>Base:</strong> ₹ {item.baseSalary}
                </p>
                <p>
                  <strong>Advance:</strong> ₹ {item.advance}
                </p>
                <p>
                  <strong>Bonus:</strong> ₹ {item.bonus}
                </p>
                <p>
                  <strong>Penalty:</strong> ₹ {item.penalty}
                </p>
                <p className="font-semibold">
                  <strong>Net Pay:</strong> ₹ {netPay(item)}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DialogContent>
  );
}
