"use client";

import { useState, useEffect } from "react";

import {
  Package,
  TrendingUp,
  Wallet,
  RefreshCw,
  IndianRupee,
  Activity,
} from "lucide-react";

import Navbar from "../_components/Navbar";
import ProfitChart from "../_components/ProfitChart";
import WeeklyTrendChart from "../_components/WeeklyTrendChart";
import ProfitVsCostChart from "../_components/ProfitVsCostChart";

/* =======================================================
   KPI CARD COMPONENT
======================================================= */
function StatCard({
  title,
  value,
  icon,
  gradient,
  subtitle,
}) {
  return (
    <div
      className={`
        relative overflow-hidden
        rounded-3xl
        p-6
        shadow-lg
        text-white
        ${gradient}
        transition-all
        duration-300
        hover:scale-[1.02]
        hover:shadow-2xl
      `}
    >
      {/* Background Glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />

      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-white/80 text-sm uppercase tracking-wider">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2 break-words">
            {value}
          </h2>

          <p className="text-sm mt-3 text-white/80">
            {subtitle}
          </p>
        </div>

        <div className="bg-white/20 p-3 rounded-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
    /* =======================================================
     STATES
  ======================================================= */
  const [totals, setTotals] = useState({
    totalConsignments: 0,
    totalProfit: 0,
    totalCost: 0,
  });

  const [analysisData, setAnalysisData] = useState([]);
  const [analysisType, setAnalysisType] = useState("monthly");

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyProfit, setMonthlyProfit] = useState([]);
  const [profitVsCost, setProfitVsCost] = useState([]);

  const [loading, setLoading] = useState(false);

  /* =======================================================
     CALCULATED METRICS
  ======================================================= */

  const revenue = totals.totalProfit || 0;
  const cost = totals.totalCost || 0;

  const netProfit = revenue - cost;

  const profitMargin =
    revenue > 0
      ? ((netProfit / revenue) * 100).toFixed(1)
      : 0;

  const bestMonth =
    monthlyProfit.length > 0
      ? monthlyProfit.reduce((prev, current) =>
          prev.totalProfit > current.totalProfit
            ? prev
            : current
        )
      : null;

  /* =======================================================
     FETCH TOTALS
  ======================================================= */

  const fetchTotals = async () => {
    try {
      const res = await fetch("/api/dashboard", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch totals");
      }

      const data = await res.json();

      setTotals({
        totalConsignments:
          data.totalConsignments || 0,
        totalProfit:
          data.totalProfit || 0,
        totalCost:
          data.totalCost || 0,
      });
    } catch (error) {
      console.error(
        "Failed to fetch totals:",
        error
      );
    }
  };

  /* =======================================================
     FETCH MONTHLY PROFIT
  ======================================================= */

  const fetchMonthlyProfit = async () => {
    try {
      const res = await fetch(
        "/api/dashboard/monthly-profit",
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch monthly profit"
        );
      }

      const data = await res.json();

      setMonthlyProfit(data || []);
    } catch (error) {
      console.error(
        "Monthly profit error:",
        error
      );
    }
  };

  /* =======================================================
     FETCH WEEKLY DATA
  ======================================================= */

  const fetchWeekly = async () => {
    try {
      const res = await fetch(
        "/api/dashboard/weekly",
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch weekly analytics"
        );
      }

      const data = await res.json();

      setWeeklyData(data || []);
    } catch (error) {
      console.error(
        "Weekly analytics error:",
        error
      );
    }
  };

  /* =======================================================
     FETCH PROFIT VS COST
  ======================================================= */

  const fetchProfitVsCost = async () => {
    try {
      const res = await fetch(
        "/api/dashboard/profit-vs-cost",
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch profit vs cost"
        );
      }

      const data = await res.json();

      setProfitVsCost(data || []);
    } catch (error) {
      console.error(
        "Profit vs cost error:",
        error
      );
    }
  };

  /* =======================================================
     FETCH ANALYSIS
  ======================================================= */

  const fetchAnalysis = async (
    type,
    start = "",
    end = ""
  ) => {
    try {
      const params = new URLSearchParams({
        type,
      });

      if (start) {
        params.append("start", start);
      }

      if (end) {
        params.append("end", end);
      }

      const res = await fetch(
        `/api/dashboard/analysis?${params}`,
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch analysis"
        );
      }

      const data = await res.json();

      setAnalysisData(data || []);
    } catch (error) {
      console.error(
        "Analysis fetch error:",
        error
      );
    }
  };

  /* =======================================================
     REFRESH DASHBOARD
  ======================================================= */

  const refreshDashboard = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchTotals(),
        fetchWeekly(),
        fetchMonthlyProfit(),
        fetchProfitVsCost(),
      ]);

      await fetchAnalysis(analysisType);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    refreshDashboard();
  }, []);

  /* =======================================================
     ANALYSIS HANDLERS
  ======================================================= */

  const handleAnalysisClick = (type) => {
    setAnalysisType(type);

    if (type !== "custom") {
      fetchAnalysis(type);
    }
  };

  const handleCustomAnalysis = () => {
    if (!customStart || !customEnd) {
      return;
    }

    setAnalysisType("custom");

    fetchAnalysis(
      "custom",
      customStart,
      customEnd
    );
  };
    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8 mt-8">

        {/* =======================================================
            HEADER
        ======================================================= */}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 mt-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Consignment Analytics
            </h1>

            <p className="text-slate-500 mt-2">
              Monitor consignments, profits and business growth
            </p>
          </div>

          <div className="flex items-center gap-3 mt-5 lg:mt-0">
            <div className="bg-white px-4 py-2 rounded-xl shadow border">
              <span className="text-sm text-slate-600">
                {new Date().toLocaleString()}
              </span>
            </div>

            <button
              onClick={refreshDashboard}
              disabled={loading}
              className="
                flex items-center gap-2
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-4 py-2
                rounded-xl
                transition
              "
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />

              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* =======================================================
            KPI CARDS
        ======================================================= */}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

          <StatCard
            title="Consignments"
            value={totals.totalConsignments}
            subtitle="Total shipments"
            icon={<Package size={28} />}
            gradient="bg-gradient-to-r from-blue-500 to-blue-700"
          />

          <StatCard
            title="Revenue"
            value={`₹${totals.totalProfit.toLocaleString()}`}
            subtitle="Generated amount"
            icon={<IndianRupee size={28} />}
            gradient="bg-gradient-to-r from-green-500 to-green-700"
          />

          <StatCard
            title="Cost"
            value={`₹${totals.totalCost.toLocaleString()}`}
            subtitle="Operational expenses"
            icon={<Wallet size={28} />}
            gradient="bg-gradient-to-r from-red-500 to-red-700"
          />

          <StatCard
            title="Net Profit"
            value={`₹${netProfit.toLocaleString()}`}
            subtitle={`${profitMargin}% margin`}
            icon={<TrendingUp size={28} />}
            gradient="bg-gradient-to-r from-purple-500 to-purple-700"
          />
        </div>

        {/* =======================================================
            INSIGHTS SECTION
        ======================================================= */}

        <div className="grid lg:grid-cols-3 gap-6 mb-10">

          {/* Profit Margin */}

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
            <h3 className="font-semibold text-lg text-slate-800">
              Profit Margin
            </h3>

            <div className="mt-6">

              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{
                    width: `${Math.min(
                      Number(profitMargin),
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-3xl font-bold text-green-600">
                {profitMargin}%
              </p>
            </div>
          </div>

          {/* Best Month */}

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
            <h3 className="font-semibold text-lg text-slate-800">
              Best Performing Month
            </h3>

            <div className="mt-6">

              <p className="text-2xl font-bold text-slate-800">
                {bestMonth?.period || "No Data"}
              </p>

              <p className="text-green-600 text-lg mt-3 font-semibold">
                ₹
                {bestMonth?.totalProfit?.toLocaleString() ||
                  0}
              </p>
            </div>
          </div>

          {/* AI Insights */}

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center gap-2">
              <Activity size={20} />
              <h3 className="font-semibold text-lg text-slate-800">
                Business Insights
              </h3>
            </div>

            <ul className="mt-5 space-y-3 text-sm text-slate-600">

              <li>
                Total Consignments:
                <span className="font-semibold ml-2">
                  {totals.totalConsignments}
                </span>
              </li>

              <li>
                Revenue:
                <span className="font-semibold ml-2">
                  ₹{totals.totalProfit.toLocaleString()}
                </span>
              </li>

              <li>
                Net Profit:
                <span className="font-semibold ml-2">
                  ₹{netProfit.toLocaleString()}
                </span>
              </li>

              <li>
                Profit Margin:
                <span className="font-semibold ml-2">
                  {profitMargin}%
                </span>
              </li>

            </ul>
          </div>

        </div>
                {/* =======================================================
            ANALYSIS SECTION
        ======================================================= */}

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 mb-10">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Analytics Overview
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                Analyze monthly, yearly and custom business performance
              </p>
            </div>

            {/* Filter Buttons */}

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() =>
                  handleAnalysisClick("monthly")
                }
                className={`px-4 py-2 rounded-xl font-medium transition-all
                  ${
                    analysisType === "monthly"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                Monthly
              </button>

              <button
                onClick={() =>
                  handleAnalysisClick("yearly")
                }
                className={`px-4 py-2 rounded-xl font-medium transition-all
                  ${
                    analysisType === "yearly"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* =======================================================
              CUSTOM DATE FILTER
          ======================================================= */}

          <div className="grid md:grid-cols-4 gap-4 mb-8">

            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Start Date
              </label>

              <input
                type="date"
                value={customStart}
                onChange={(e) =>
                  setCustomStart(e.target.value)
                }
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-slate-300
                  rounded-xl
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-2">
                End Date
              </label>

              <input
                type="date"
                value={customEnd}
                onChange={(e) =>
                  setCustomEnd(e.target.value)
                }
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-slate-300
                  rounded-xl
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            <div className="flex items-end">

              <button
                onClick={handleCustomAnalysis}
                className="
                  w-full
                  bg-indigo-600
                  hover:bg-indigo-700
                  text-white
                  px-4
                  py-3
                  rounded-xl
                  font-medium
                  transition-all
                "
              >
                Apply Filter
              </button>

            </div>

          </div>

          {/* =======================================================
              ANALYSIS TABLE
          ======================================================= */}

          {analysisData.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">

              <table className="w-full">

                <thead>

                  <tr className="bg-slate-100">

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Period
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Consignments
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Total Cost
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Revenue
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Net Profit
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {analysisData.map(
                    (item, index) => {
                      const rowProfit =
                        item.totalProfit -
                        item.totalCost;

                      return (
                        <tr
                          key={index}
                          className="
                            border-t
                            border-slate-200
                            hover:bg-slate-50
                            transition
                          "
                        >
                          <td className="px-5 py-4 font-medium text-slate-700">
                            {item.period}
                          </td>

                          <td className="px-5 py-4">
                            {item.consignments}
                          </td>

                          <td className="px-5 py-4 text-red-600 font-medium">
                            ₹
                            {item.totalCost.toLocaleString()}
                          </td>

                          <td className="px-5 py-4 text-blue-600 font-medium">
                            ₹
                            {item.totalProfit.toLocaleString()}
                          </td>

                          <td className="px-5 py-4 text-green-600 font-semibold">
                            ₹
                            {rowProfit.toLocaleString()}
                          </td>
                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              No analytics data available
            </div>
          )}

        </div>
                {/* =======================================================
            CHARTS SECTION
        ======================================================= */}

        <div className="mb-10">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Performance Analytics
            </h2>

            <span className="text-sm text-slate-500">
              Visual representation of business growth
            </span>
          </div>

          {/* Top Charts */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            <ProfitChart data={monthlyProfit} />

            <WeeklyTrendChart data={weeklyData} />

          </div>

          {/* Full Width Chart */}

          <div className="mt-6">
            <ProfitVsCostChart data={profitVsCost} />
          </div>

        </div>

        {/* =======================================================
            BUSINESS SUMMARY
        ======================================================= */}

        <div className="grid lg:grid-cols-3 gap-6 mb-10">

          {/* Revenue Summary */}

          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">

            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Revenue Summary
            </h3>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Total Revenue
                </span>

                <span className="font-semibold text-green-600">
                  ₹{totals.totalProfit.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Total Cost
                </span>

                <span className="font-semibold text-red-600">
                  ₹{totals.totalCost.toLocaleString()}
                </span>
              </div>

              <div className="border-t pt-4 flex justify-between">
                <span className="font-medium">
                  Net Profit
                </span>

                <span className="font-bold text-blue-600">
                  ₹{netProfit.toLocaleString()}
                </span>
              </div>

            </div>

          </div>

          {/* Consignment Summary */}

          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">

            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Consignment Summary
            </h3>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Total Consignments
                </span>

                <span className="font-semibold">
                  {totals.totalConsignments}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Average Revenue
                </span>

                <span className="font-semibold">
                  ₹
                  {totals.totalConsignments > 0
                    ? (
                        totals.totalProfit /
                        totals.totalConsignments
                      ).toFixed(0)
                    : 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Average Cost
                </span>

                <span className="font-semibold">
                  ₹
                  {totals.totalConsignments > 0
                    ? (
                        totals.totalCost /
                        totals.totalConsignments
                      ).toFixed(0)
                    : 0}
                </span>
              </div>

            </div>

          </div>

          {/* Growth Card */}

          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">

            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Business Health
            </h3>

            <div className="space-y-4">

              <div>
                <p className="text-sm text-slate-500 mb-2">
                  Profit Margin
                </p>

                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        Number(profitMargin),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-2 font-bold text-green-600">
                  {profitMargin}%
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-slate-500 text-sm">
                  Current Status
                </p>

                <p className="font-semibold text-green-600 mt-1">
                  Healthy Business Growth
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}