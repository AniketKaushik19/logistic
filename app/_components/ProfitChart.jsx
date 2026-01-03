"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProfitChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
      <h3 className="text-base sm:text-lg font-semibold mb-4">
        Monthly Profit
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
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

          <Line
            type="monotone"
            dataKey="totalProfit"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
