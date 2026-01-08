"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { IndianRupee } from "lucide-react";

export default function ProfitModal({ consignment, onClose, onSave ,fetchItems }) {
  const [totalCost, setTotalCost] = useState(
    consignment?.amount || ""
  );
  const [expenses, setExpenses] = useState(
    consignment?.profit?.expenses || ""
  );
  const [netProfit, setNetProfit] = useState("");

  useEffect(() => {
    const exp = Number(expenses) || 0;
    const profit = totalCost - exp; // negative allowed
    setNetProfit(profit.toFixed(2));
  }, [expenses, totalCost]);


 const handleSave = async () => {
  if (!consignment?._id) {
    toast.error("Consignment ID is missing");
    return;
  }

  try {
    const res = await fetch(`/api/consignment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _id:consignment._id,
        profit: Number(netProfit),
        totalCost: Number(totalCost),
        expenses: Number(expenses),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data?.error || "API failed");
    }

    const data = await res.json();
    onSave(data.data.profit?.amount ?? netProfit);
    toast.success("Profit saved");
    fetchItems()
    onClose();
  } catch (err) {
    console.error("Save failed:", err);
    toast.error(err.message || "Failed to save profit");
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <IndianRupee /> Add Profit for {consignment.cn}
        </h2>

        <input
          type="number"
          value={totalCost }
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
          className="w-full p-2 mb-4 border rounded bg-gray-100"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 hover:cursor-pointer text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
