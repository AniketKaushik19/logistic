"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { generateSalaryPDF } from "@/utils/generateSalaryPDF";
import { Download } from "lucide-react";
import { generateSalaryHistoryPDF } from "@/utils/generateSalaryHistoryPDF";

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
        { credentials: "include" },
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
      new Set(history.map((h) => h.month?.split("-")[0]).filter(Boolean)),
    );
  }, [history]);

  const months = useMemo(() => {
    return Array.from(
      new Set(
        history
          .filter((h) => year === "all" || h.month?.startsWith(year))
          .map((h) => h.month?.split("-")[1])
          .filter(Boolean),
      ),
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
    // Use stored netPay if available (from SALARY_PAID transactions)
    if (item.netPay) return item.netPay;

    // For ADVANCE_GIVEN, no net pay calculation
    if (item.transactionType === "ADVANCE_GIVEN") return 0;

    // Fallback: Net Pay = Salary + Bonus - Advance
    return (
      Number(item.salary || 0) +
      Number(item.bonus || 0) -
      Number(item.advance || 0)
    );
  };
  return (
    <DialogContent className="sm:max-w-[780px] bg-white p-5">
      <h3 className="text-lg font-semibold mb-4">
        Salary History – {driver.name}
      </h3>
      {/* ===== FILTER BAR ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2 hover:cursor-pointer"
          onClick={() =>
            generateSalaryHistoryPDF({
              driver,
              filters: { year, month, fromDate, toDate },
              data: filteredHistory,
            })
          }
        >
          <Download size={16} />
          Print Report
        </Button>

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
          {filteredHistory.map((item, idx) => {
            const isAdvanceGiven = item.transactionType === "ADVANCE_GIVEN";
            const isSalaryPaid = item.transactionType === "SALARY_PAID";

            return (
              <div
                key={idx}
                className={`rounded-lg p-4 shadow-sm hover:shadow-md transition ${
                  isAdvanceGiven ? "bg-orange-50" : "bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                     {new Date(item.month).toLocaleString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                    </span>

                  <div className="flex gap-2 items-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        isAdvanceGiven
                          ? "bg-orange-100 text-orange-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isAdvanceGiven ? "💰 Advance Given" : "✓ Salary Paid"}
                    </span>

                    {isSalaryPaid && (
                      <button
                        className="hover:cursor-pointer"
                        onClick={() =>
                          generateSalaryPDF({
                            month: item.month,
                            driverName: driver.name,
                            status: "Paid",
                            salary: item.salary,
                            advance: item.advance,
                            bonus: item.bonus,
                            paidAt: item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "-",
                          })
                        }
                      >
                        <Download />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {/* For ADVANCE_GIVEN */}
                  {isAdvanceGiven && (
                    <>
                      <p>
                        <strong>Advance Given:</strong> ₹ {item.advance}
                      </p>
                    </>
                  )}

                  {/* For SALARY_PAID */}
                  {isSalaryPaid && (
                    <>
                      {item.salary > 0 && (
                        <p>
                          <strong>Salary:</strong> ₹ {item.salary}
                        </p>
                      )}
                      {item.advance > 0 && (
                        <p>
                          <strong>Advance Settled:</strong> ₹ {item.advance}
                        </p>
                      )}
                      {item.bonus > 0 && (
                        <p>
                          <strong>Bonus:</strong> ₹ {item.bonus}
                        </p>
                      )}
                      <p className="font-semibold text-emerald-600">
                        <strong>Net Pay:</strong> ₹ {netPay(item)}
                      </p>
                    </>
                  )}

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
            );
          })}
        </div>
      )}
    </DialogContent>
  );
}
