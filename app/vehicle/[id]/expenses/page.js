"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  IndianRupee,
  TrendingUp,
  Filter,
  Loader2,
  Plus,
} from "lucide-react";
import { useParams } from "next/navigation";
import Navbar from "@/app/_components/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
export default function ExpensesPage() {
  const { id } = useParams();
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalMaintenance, setTotalMaintenance] = useState(0);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [latestMaintenanceDate, setLatestMaintenanceDate] = useState("");
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [netProfit, setNetProfit] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalLoading, setTotalLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [latestOnly, setLatestOnly] = useState(false);
  const [period, setPeriod] = useState("monthly");
  const expensesRef = useRef([]);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const limit = 10;

  const formatDate = (value) => {
    if (!value) return "No records";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchTotalExpenses = useCallback(async () => {
    setTotalLoading(true);
    try {
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
        credentials: "include",
      });
      const data = await response.json();
     console.log(data);
     
      
      if (data.success) {
        setTotalAmount(data.totalAmount);
        setTotalExpense(data.totalExpense);
        setTotalMaintenance(data.totalMaintenance || 0);
        setMaintenanceCount(data.maintenanceCount || 0);
        setLatestMaintenanceDate(data.latestMaintenanceDate || "");
        setNetProfit(data.netProfit);
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
        const currentSkip = reset ? 0 : expensesRef.current.length;
        const params = new URLSearchParams({
          vehicleId: id,
          limit: latestOnly ? 5 : limit,
          skip: currentSkip,
          latest: latestOnly.toString(),
          period,
        });

        if (period === "custom" && customStartDate && customEndDate) {
          params.append("startDate", customStartDate);
          params.append("endDate", customEndDate);
        }

        const response = await fetch(`/api/expense?${params}`, {
          cache: "no-store",
          credentials: "include",
        });
        const data = await response.json();

        if (data.status === "200") {
          setExpenses((prev) => {
            const next = reset ? data.expenses : [...prev, ...data.expenses];
            expensesRef.current = next;
            return next;
          });
          setHasMore(data.hasMore);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    },
    [latestOnly, limit, id, period, customStartDate, customEndDate]
  );

  const fetchMaintenanceRecords = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        vehicleId: id,
        period,
      });

      if (period === "custom" && customStartDate && customEndDate) {
        params.append("startDate", customStartDate);
        params.append("endDate", customEndDate);
      }

      const response = await fetch(`/api/maintaince?${params}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json();

      if (data.status === "200") {
        setMaintenanceRecords(data.records || []);
      }
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
    }
  }, [id, period, customStartDate, customEndDate]);

  useEffect(() => {
    fetchTotalExpenses();
  }, [fetchTotalExpenses]);

  useEffect(() => {
    fetchExpenses(true);
    fetchMaintenanceRecords();
  }, [latestOnly, period, customStartDate, customEndDate, fetchExpenses, fetchMaintenanceRecords]);

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
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 mt-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-7">
                Expenses Dashboard
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Track and manage your vehicle spending for <span className="text-black font-bold text-xl">
                  {id} </span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
                    <Plus size={18} className="text-white" />
                    Manage Vehicle
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-white">
                  <DialogHeader>
                    <DialogTitle>Manage Vehicle</DialogTitle>
                  </DialogHeader>
                  <div className="h-[75vh] overflow-hidden rounded-xl border border-slate-200">
                    <iframe
                      src={`/vehicle/${id}`}
                      title={`Manage Vehicle ${id}`}
                      className="w-full h-full"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 bg-linear-to-r from-red-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-red-600 hover:to-blue-600 transition-all">
                    <Plus size={18} className="text-white" />
                    Maintaince
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-white">
                  <DialogHeader>
                    <DialogTitle>Maintaince</DialogTitle>
                  </DialogHeader>
                  <div className="h-[75vh] overflow-hidden rounded-xl border border-slate-200">
                    <iframe
                      src={`/vehicle/${id}/maintaince`}
                      title={`Maintaince ${id}`}
                      className="w-full h-full"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* Total lorry hire Card */}
            <Card className="bg-linear-to-br from-green-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <IndianRupee size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">
                        Total Lorry Hire
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

            {/* Total Expense Card */}
            <Card className="bg-linear-to-br from-orange-500 to-yellow-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
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
                          `₹${totalExpense.toLocaleString("en-IN")}`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Maintenance Card */}
            <Card className="bg-linear-to-br from-purple-500 to-fuchsia-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">
                        Total Maintenance
                      </p>
                      <p className="text-white text-xl sm:text-2xl font-bold">
                        {totalLoading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          `₹${totalMaintenance.toLocaleString("en-IN")}`
                        )}
                      </p>
                      <p className="text-white/70 text-xs mt-1">
                        {maintenanceCount} records · Latest: {formatDate(latestMaintenanceDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Net Profit Card */}
            <Card className="bg-linear-to-br from-blue-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <IndianRupee size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">
                        Total Net Profit
                      </p>
                      <p className="text-white text-xl sm:text-2xl font-bold">
                        {totalLoading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          `₹${netProfit.toLocaleString("en-IN")}`
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
                    color: "bg-gray-100  hover:bg-gray-200 text-gray-700",
                  },
                  {
                    key: "monthly",
                    label: "This Month",
                    color: "bg-blue-100  hover:bg-blue-200 text-blue-700",
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
                    variant={period === p.key ? "default" : "primary"}
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
                    <div className="relative">
                      <input
                        type="date"
                        placeholder="Select start date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      {!customStartDate && (
                        <span className="md:hidden pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          Select start date
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        placeholder="Select end date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      {!customEndDate && (
                        <span className="md:hidden pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          Select end date
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Toggle */}
              <div className="flex justify-center sm:justify-end">
                <Button
                  onClick={() => setLatestOnly(!latestOnly)}
                  variant={latestOnly ? "default" : "primary"}
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
                key={`${index}`}
                className="group bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              >
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 truncate">
                    {expense.title || "Expense"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <IndianRupee size={16} className="text-green-600" />
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-gray-900">
                      {parseFloat(expense.Amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>
                      {new Date(expense.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <IndianRupee size={16} className="text-orange-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium">Total Expense</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{parseFloat(expense.totalExpense || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <IndianRupee size={16} className="text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium">Net Profit</span>
                        <span className={`text-sm font-semibold ${
                          (parseFloat(expense.Amount || 0) - parseFloat(expense.totalExpense || 0)) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          ₹{(parseFloat(expense.Amount || 0) - parseFloat(expense.totalExpense || 0)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
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
          {!latestOnly && hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={loadMore}
                disabled={loading}
                className="bg-linear-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 rounded-xl"
              >
                {loading ? "Loading more..." : "Load More Expenses"}
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

          {/* Maintenance Grid */}
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Maintenance Records</h2>
                <p className="text-sm text-gray-500">
                  Recent maintenance entries for this vehicle.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right p-3 bg-white/90 rounded-lg shadow">
                  <p className="text-xs text-gray-500">Total Maintenance</p>
                  <p className="text-lg font-semibold text-gray-900">₹{totalMaintenance.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-500">{maintenanceCount} records</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {maintenanceRecords.map((record, index) => (
                <Card
                  key={`${record._id || index}`}
                  className="group bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-200 truncate">
                        {record.description || "Maintenance"}
                      </CardTitle>
                      <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
                        by {record.createdBy || "Unknown"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <IndianRupee size={16} className="text-purple-600" />
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        ₹{parseFloat(record.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>
                        {new Date(record.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500">
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>{" "}
                        {new Date(record.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!loading && maintenanceRecords.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-5xl sm:text-6xl mb-4">🛠️</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                    No maintenance records yet
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Add maintenance entries to see them here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
