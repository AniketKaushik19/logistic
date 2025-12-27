"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { IndianRupee } from "lucide-react";

export default function ProfitModal({ consignment, onClose, onSave }) {
  const [totalCost, setTotalCost] = useState(consignment.amount || "");
  const [expenses, setExpenses] = useState("");
  const [netProfit, setNetProfit] = useState("");
  const [date, setDate] = useState(
    consignment.createdAt
      ? new Date(consignment.createdAt).toISOString().split("T")[0]
      : ""
  );

  useEffect(() => {
    const total = parseFloat(totalCost) || 0;
    const exp = parseFloat(expenses) || 0;
    setNetProfit((total - exp).toFixed(2));
  }, [totalCost, expenses]);

const handleSave = async () => {
  try {
    const token = localStorage.getItem("auth_token");

    const res = await fetch(
      `/api/consignment/${consignment._id}/profit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profit: Number(netProfit) }),
      }
    );
console.log(res)
    if (!res.ok) {
      throw new Error("API failed");
    }

    const data = await res.json();

    onSave(data.profit);
    toast.success("Profit saved");
    onClose();
  } catch (err) {
    console.error(err);
    toast.error("Failed to save profit");
  }
};



  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <IndianRupee /> Add Profit for {consignment.cn}
        </h2>

        <input
          type="number"
          value={totalCost}
          onChange={(e) => setTotalCost(e.target.value)}
          placeholder="Total Cost"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
          placeholder="Expenses"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          value={netProfit}
          readOnly
          placeholder="Net Profit"
          className="w-full p-2 mb-2 border rounded bg-gray-100"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
