"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function WeeklyTrendChart({ data = [] }) {
  if (!data || data.length < 2) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          Weekly Trend
        </h3>
        <p className="text-sm">Not enough data to display weekly trend</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
      <h3 className="text-base sm:text-lg font-semibold mb-4">
        Weekly Profit Trend
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
            angle={-30}
            textAnchor="end"
            height={50}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            width={40}
          />

          <Tooltip
            contentStyle={{
              fontSize: "0.85rem",
              borderRadius: "8px",
            }}
          />

          <Bar
            dataKey="totalProfit"
            fill="#16a34a"
            fillOpacity={0.6}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
