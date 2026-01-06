"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function SalaryActions({ driver, onClose, onUpdated }) {
  const salary = driver?.salaryDetails || {};
  const alreadyPaid = salary?.status === "Paid";

  const [advance, setAdvance] = useState("");
  const [bonus, setBonus] = useState("");
  const [penalty, setPenalty] = useState("");
  const [markPaid, setMarkPaid] = useState(false);

useEffect(() => {
  if (alreadyPaid) {
    setMarkPaid(true);
  }
}, [alreadyPaid]);

  const submit = async () => {
    const res = await fetch("/api/driver/salary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        driverId: driver._id,
        type: "UPDATE",
        advance: Number(advance) || 0,
        bonus: Number(bonus) || 0,
        penalty: Number(penalty) || 0,
        markPaid,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error || "Failed");
      return;
    }

    toast.success("Salary updated successfully");
    onUpdated?.(); 
    onClose();
  };

  return (
    <div className="space-y-3">
      <input
        type="number"
        className="w-full border rounded p-2"
        placeholder="Advance Amount"
        value={advance}
        onChange={(e) => setAdvance(e.target.value)}
      />
      <input
        type="number"
        className="w-full border rounded p-2"
        placeholder="Bonus Amount"
        value={bonus}
        onChange={(e) => setBonus(e.target.value)}
      />
      <input
        type="number"
        className="w-full border rounded p-2"
        placeholder="Penalty Amount"
        value={penalty}
        onChange={(e) => setPenalty(e.target.value)}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={markPaid}
          disabled={alreadyPaid} // ✅ disabled if already paid
          onChange={(e) => setMarkPaid(e.target.checked)}
        />
        {alreadyPaid ? "Salary Already Paid" : "Mark Salary as Paid"}
      </label>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit}>Submit</Button>
      </div>
    </div>
  );
}
