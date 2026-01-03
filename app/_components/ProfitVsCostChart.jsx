"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ProfitVsCostChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          Profit vs Cost
        </h3>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
      <h3 className="text-base sm:text-lg font-semibold mb-4">
       Yearly  Amount vs Cost Comparison
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, bottom: 60, left: 0 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={50}
            interval={0}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            width={60}
            label={{ value: "Amount (₹)", angle: -90, position: "insideLeft", offset: 10, fontSize: 12 }}
          />

          <Tooltip
            formatter={(value) => `₹${value.toLocaleString()}`}
            contentStyle={{
              fontSize: "0.85rem",
              borderRadius: "8px",
              padding: "8px",
            }}
          />

          <Legend verticalAlign="top" height={36} />

          <Bar
            dataKey="totalProfit"
            name="Amount"
            fill="#2563eb"
            fillOpacity={0.8}
            radius={[6, 6, 0, 0]}
          />

          <Bar
            dataKey="totalCost"
            name="Cost"
            fill="#ef4444"
            fillOpacity={0.8}
            radius={[6, 6, 0, 0]}
          />

          {data[0].netProfit !== undefined && (
            <Bar
              dataKey="netProfit"
              name="Profit"
              fill="#16a34a"
              fillOpacity={0.8}
              radius={[6, 6, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
