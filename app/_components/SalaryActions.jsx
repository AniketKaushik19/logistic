"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function SalaryActions({
  driver,
  onClose,
  onUpdated,
}) {
  const [loading,setLoading]=useState(false);
  const salary = driver?.salaryDetails || {};

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(
    salary?.month || currentMonth
  );

  const [action, setAction] = useState("PAY_SALARY"); // "GIVE_ADVANCE" or "PAY_SALARY"

  // For GIVE_ADVANCE
  const [advanceAmount, setAdvanceAmount] = useState("");

  // For PAY_SALARY
  const [salaryAmount, setSalaryAmount] = useState(salary?.salary || "");
  const [bonus, setBonus] = useState(salary?.bonus || "");
  const [settleAdvance, setSettleAdvance] = useState(false);

  const pendingAdvance = salary?.pendingAdvance || 0;
  const advanceToSettle = settleAdvance
    ? Math.min(pendingAdvance, Number(salaryAmount) || 0)
    : 0;
  const amountToPay =
    (Number(salaryAmount) || 0) +
    (Number(bonus) || 0) -
    advanceToSettle;

  const submit = async () => {
        setLoading(true);

    if (action === "GIVE_ADVANCE") {
      if (!advanceAmount || Number(advanceAmount) <= 0) {
        toast.error("Enter valid advance amount");
        setLoading(false);
        return;
      }
    } else {
      const salaryValue = Number(salaryAmount) || 0;
      const bonusValue = Number(bonus) || 0;
      if (salaryValue < 0 || bonusValue < 0 || salaryValue + bonusValue <= 0) {
        toast.error("Enter a salary or bonus amount greater than zero");
        setLoading(false);
        return;
      }
    }

    const payload = {
      driverId: driver._id,
      type: "UPDATE",
      month: selectedMonth,
      action: action,
    };

    if (action === "GIVE_ADVANCE") {
      payload.advance = Number(advanceAmount) || 0;
    } else {
      payload.salary = Number(salaryAmount) || 0;
      payload.bonus = Number(bonus) || 0;
      payload.settleAdvance = settleAdvance;
    }

    const res = await fetch("/api/driver/salary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error || "Failed");
          setLoading(false);
      return;
    }
              setLoading(false);

    const message = action === "GIVE_ADVANCE" 
      ? `Advance ₹${advanceAmount} given. Pending balance: ₹${json.pendingAdvance}`
      : `Salary paid! Advance settled: ₹${json.advanceSettled}, Net Pay: ₹${json.netPay}`;
    
    toast.success(message);

  /* ================= RESET FORM ================= */

  setAdvanceAmount("");
  setBonus("");
  setSettleAdvance(false);
  setAction("PAY_SALARY");

    onUpdated?.();
    onClose();
  };

  return (
    <div className="space-y-4 overflow-scroll h-[80vh]">
      {/* Month Selector */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-1 block">
          Month
        </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Action Selector */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Action
        </label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="PAY_SALARY"
              checked={action === "PAY_SALARY"}
              onChange={(e) => setAction(e.target.value)}
            />
            <span className="text-sm">Pay Salary</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="GIVE_ADVANCE"
              checked={action === "GIVE_ADVANCE"}
              onChange={(e) => setAction(e.target.value)}
            />
            <span className="text-sm">Give Advance</span>
          </label>
        </div>
      </div>

      {/* GIVE ADVANCE ACTION */}
      {action === "GIVE_ADVANCE" && (
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">
            Advance Amount
          </label>
          <input
            type="number"
            value={advanceAmount}
            onChange={(e) => setAdvanceAmount(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter advance amount"
            min={0}
          />
          {pendingAdvance > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              ℹ️ Pending advance balance: ₹{pendingAdvance}
            </p>
          )}
        </div>
      )}

      {/* PAY SALARY ACTION */}
      {action === "PAY_SALARY" && (
        <div className="space-y-3">
          {/* Pending Advance Alert */}
          {pendingAdvance > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded p-4">
              <p className="text-sm font-bold text-amber-900">
                ⚠️ PENDING ADVANCE FROM BEFORE
              </p>
              <p className="text-lg font-bold text-amber-700 mt-1">
                ₹{pendingAdvance.toLocaleString()} pending
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Select the option below if you want to settle this advance from this payout.
              </p>
              <label className="flex items-center gap-2 mt-3 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={settleAdvance}
                  onChange={(e) => setSettleAdvance(e.target.checked)}
                  className="size-4"
                />
                Settle advance from this salary payout
              </label>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Salary Amount (optional)
            </label>
            <input
              type="number"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              className="w-full border-2 border-blue-300 rounded p-2 text-lg font-semibold"
              placeholder="Leave blank to pay bonus only"
              min={0}
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave blank if you are paying only a bonus
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Bonus
            </label>
            <input
              type="number"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Bonus amount (optional)"
              min={0}
            />
          </div>


          {/* Advance Settlement Info */}
          {pendingAdvance > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded p-4 font-mono text-sm">
              <p className="text-sm font-bold text-slate-800 mb-3">
                📊 CALCULATION BREAKDOWN:
              </p>
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Salary Amount:</span>
                  <span className="font-bold text-lg">₹{Number(salaryAmount || 0).toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center text-red-600">
                    <span>- Advance Settled:</span>
                    <span className="font-bold">₹{advanceToSettle.toLocaleString()}</span>
                  </div>
                </div>
                {Number(bonus || 0) > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>+ Bonus:</span>
                    <span className="font-bold">₹{Number(bonus || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t-2 border-green-300 pt-2 mt-2">
                  <div className="flex justify-between items-center bg-green-100 p-2 rounded font-bold text-lg">
                    <span>💰 ACTUALLY PAY DRIVER:</span>
                    <span className="text-green-700">₹{amountToPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {pendingAdvance === 0 && (
            <div className="bg-green-50 border-2 border-green-300 rounded p-4 font-mono text-sm">
              <p className="text-sm font-bold text-green-800 mb-3">
                📊 CALCULATION:
              </p>
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Salary Amount:</span>
                  <span className="font-bold text-lg">₹{Number(salaryAmount || 0).toLocaleString()}</span>
                </div>
                {Number(bonus || 0) > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>+ Bonus:</span>
                    <span className="font-bold">₹{Number(bonus || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t-2 border-green-300 pt-2 mt-2">
                  <div className="flex justify-between items-center bg-green-100 p-2 rounded font-bold text-lg">
                    <span>✓ Amount to Pay:</span>
                    <span className="text-green-700">₹{(
                      Number(salaryAmount || 0) + Number(bonus || 0)
                    ).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>

        <Button onClick={submit} disabled={loading}>
          {action === "GIVE_ADVANCE" ? "Give Advance" : "Pay"}
        </Button>
      </div>
    </div>
  );
}