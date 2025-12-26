"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  IndianRupee,
  TrendingUp,
  Filter,
  Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";
import Navbar from "@/app/_components/Navbar";

export default function ExpensesPage() {
  const { id } = useParams();
  const [totalAmount, setTotalAmount] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalLoading, setTotalLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [latestOnly, setLatestOnly] = useState(false);
  const [period, setPeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const limit = 10;

  const fetchTotalExpenses = useCallback(async () => {
    setTotalLoading(true);
    try {
            const token = localStorage.getItem("auth_token");

      const params = new URLSearchParams({
        vehicleId: id,
        period: period,
      });

      if (period === "custom" && customStartDate && customEndDate) {
        params.append("startDate", customStartDate);
        params.append("endDate", customEndDate);
      }

      const response = await fetch(`/api/expense/total?${params}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setTotalAmount(data.totalAmount);
      }
    } catch (error) {
      console.error("Error fetching total expenses:", error);
    } finally {
      setTotalLoading(false);
    }
  }, [id, period, customStartDate, customEndDate]);

  const fetchExpenses = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
                const token = localStorage.getItem("auth_token");

        const params = new URLSearchParams({
          vehicleId:id,
          limit: latestOnly ? 5 : limit,
          skip: reset ? 0 : skip,
          latest: latestOnly.toString(),
          period
        
        });

        const response = await fetch(`/api/expense?${params}`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.status === "200") {
          setExpenses((prev) =>
            reset ? data.expenses : [...prev, ...data.expenses]
          );
          setHasMore(data.hasMore);
          if (!reset) setSkip((prev) => prev + limit);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    },
    [latestOnly, skip, limit]
  );

  useEffect(() => {
    fetchTotalExpenses();
  }, [fetchTotalExpenses]);

  useEffect(() => {
    setSkip(0);
    fetchExpenses(true);
  }, [latestOnly, fetchExpenses]);

  const loadMore = () => {
    if (!latestOnly && hasMore && !loading) {
      fetchExpenses();
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 mt-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Expenses Dashboard
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Track and manage your vehicle spending for {id}
              </p>
            </div>

            {/* Total Cost Card */}
            <Card className="bg-linear-to-br from-green-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <IndianRupee size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">
                        Total Expenses
                      </p>
                      <p className="text-white text-xl sm:text-2xl font-bold">
                        {totalLoading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          `₹${totalAmount.toLocaleString("en-IN")}`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-gray-800">
                <Filter size={20} className="text-blue-600" />
                Filters & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Period Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  {
                    key: "all",
                    label: "All Time",
                    color: "bg-gray-100 hover:bg-gray-200 text-gray-700",
                  },
                  {
                    key: "monthly",
                    label: "This Month",
                    color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
                  },
                  {
                    key: "yearly",
                    label: "This Year",
                    color: "bg-green-100 hover:bg-green-200 text-green-700",
                  },
                  {
                    key: "custom",
                    label: "Custom Range",
                    color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
                  },
                ].map((p) => (
                  <Button
                    key={p.key}
                    onClick={() => handlePeriodChange(p.key)}
                    variant={period === p.key ? "default" : "outline"}
                    size="sm"
                    className={`transition-all duration-200 ${
                      period === p.key
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                        : `${p.color} border-0`
                    }`}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>

              {/* Custom Date Range */}
              {period === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Latest Toggle */}
              <div className="flex justify-center sm:justify-end">
                <Button
                  onClick={() => setLatestOnly(!latestOnly)}
                  variant={latestOnly ? "default" : "outline"}
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    latestOnly
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <TrendingUp size={18} />
                  {latestOnly ? "Show All Expenses" : "Show Latest Only"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {expenses.map((expense, index) => (
              <Card
                key={`${expense._id || index}`}
                className="group bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 truncate">
                    {expense.title || "Expense"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <IndianRupee size={16} className="text-green-600" />
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-gray-900">
                      ₹{parseFloat(expense.Amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>
                      {new Date(expense.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Loading State */}
            {loading && expenses.length === 0 && (
              <div className="col-span-full flex justify-center py-12">
                <div className="flex items-center gap-3 text-gray-500">
                  <Loader2 size={24} className="animate-spin" />
                  <span>Loading expenses...</span>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && expenses.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-5xl sm:text-6xl mb-4">📊</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                  No expenses found
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Add some expenses to see them here
                </p>
              </div>
            )}
          </div>

          {/* Load More */}
          {!latestOnly && hasMore && !loading && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={loadMore}
                className="bg-linear-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 rounded-xl"
              >
                Load More Expenses
              </Button>
            </div>
          )}

          {/* Loading More Indicator */}
          {loading && expenses.length > 0 && (
            <div className="flex justify-center py-6">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 size={20} className="animate-spin" />
                <span>Loading more...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
