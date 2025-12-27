"use client"

import { useState, useEffect } from 'react';
import { Package, TrendingUp, Wallet } from "lucide-react";
import Navbar from '../_components/Navbar';

export default function Dashboard() {
  const [totals, setTotals] = useState({
    totalConsignments: 0,
    totalProfit: 0,
    totalCost: 0
  });
  const [analysisData, setAnalysisData] = useState([]);
  const [analysisType, setAnalysisType] = useState('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    fetchTotals();
    handleAnalysisClick('monthly')
  }, []);

  const fetchTotals = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch('/api/dashboard', {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
        if (!res.ok) {
      throw new Error("API failed");
    }
      const data = await res.json();
      setTotals(data);
    } catch (error) {
      console.error('Failed to fetch totals:', error);
    }
  };

  const fetchAnalysis = async (type, start = '', end = '') => {
    try {
      const token = localStorage.getItem("auth_token");

      const params = new URLSearchParams({ type });
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      const res = await fetch(`/api/dashboard/analysis?${params}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        if (!res.ok) {
      throw new Error("API failed");
    }
      const data = await res.json();
      setAnalysisData(data);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    }
  };

  const handleAnalysisClick = (type) => {
    setAnalysisType(type);
    if (type === 'custom') {
      // For custom, we'll handle in the button
    } else {
      fetchAnalysis(type);
    }
  };

  const handleCustomAnalysis = () => {
    if (customStart && customEnd) {
      fetchAnalysis('custom', customStart, customEnd);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <main className="container px-4 py-8 mt-8">
        <h1 className="text-3xl font-bold text-center mt-7 mb-8 text-gray-800">Dashboard</h1>
        {/* Totals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Total Consignments */}
          <div className="group relative overflow-hidden bg-linear-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transition hover:scale-[1.03]">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm uppercase tracking-wide text-white/80">
                  Total Consignments
                </h3>
                <p className="text-3xl font-bold mt-2">
                  {totals.totalConsignments}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/20">
                <Package size={28} />
              </div>
            </div>
          </div>

          {/* Total Profit */}
          <div className="group relative overflow-hidden bg-linear-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg transition hover:scale-[1.03]">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm uppercase tracking-wide text-white/80">
                  Total Profit
                </h3>
                <p className="text-3xl font-bold mt-2">
                  ₹{totals.totalProfit.toFixed(2)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/20">
                <TrendingUp size={28} />
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="group relative overflow-hidden bg-linear-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg transition hover:scale-[1.03]">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm uppercase tracking-wide text-white/80">
                  Total Cost
                </h3>
                <p className="text-3xl font-bold mt-2">
                  ₹{totals.totalCost.toFixed(2)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/20">
                <Wallet size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Analysis</h2>

          {/* Analysis Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => handleAnalysisClick('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${analysisType === 'monthly'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleAnalysisClick('yearly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${analysisType === 'yearly'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Yearly
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
              {/* Start Date */}
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Separator */}
              <span className="hidden sm:block text-gray-600">to</span>

              {/* End Date */}
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Button */}
              <button
                onClick={handleCustomAnalysis}
                className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white
                      rounded-lg font-medium hover:bg-blue-600 transition-all"
              >
                Apply
              </button>
            </div>

          </div>

          {/* Analysis Data */}
          {analysisData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Period</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Consignments</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Total Cost</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Total Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{item.period}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.consignments}</td>
                      <td className="border border-gray-300 px-4 py-2">₹{item.totalCost.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-2">₹{item.totalProfit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}