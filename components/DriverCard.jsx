"use client";
import React from "react";
import {
  User,
  Edit2,
  Trash2,
  Wallet,
  Truck,
  CheckCircle,
  Clock,
  Printer,
  History,
  ArrowDownCircle,
  ArrowUpCircle,
  MinusCircle,
} from "lucide-react";

export default function DriverCard({
  driver,
  onEdit = () => {},
  onDelete = () => {},
  onSalary = () => {},
  onPrint = () => {},
  onHistory = () => {},
}) {
  const salaryPaid = driver.salaryStatus === "Paid";

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg transition">

      {/* Delete */}
      <button
        onClick={() => onDelete(driver)}
        className="absolute top-3 right-3 rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-100"
        title="Delete Driver"
      >
        <Trash2 className="size-4" />
      </button>

      {/* Header */}
      <div className="flex gap-4">
        <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
          <User className="size-5" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">
            {driver.name}
          </h3>

          <p className="text-sm text-slate-500">{driver.contactNumber}</p>

          {driver.emailAddress && (
            <p className="text-xs text-slate-400 mt-0.5">
              {driver.emailAddress}
            </p>
          )}

          {/* Vehicle */}
          <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            <Truck className="size-4" />
            {driver.vehicleNumber || "No Vehicle Assigned"}
          </div>
        </div>
      </div>

      {/* Salary Summary */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-400">Monthly Salary</p>
          <p className="text-lg font-bold text-indigo-600">
            ₹ {driver.salary || 0}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Current Month Status</p>
          <div
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              salaryPaid
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {salaryPaid ? (
              <>
                <CheckCircle className="size-3.5" />
                Paid
              </>
            ) : (
              <>
                <Clock className="size-3.5" />
                Pending
              </>
            )}
          </div>
        </div>
      </div>

      {/* Advance / Bonus / Penalty */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Info
          label="Advance"
          value={driver.advance || 0}
          icon={<ArrowDownCircle className="size-4 text-red-500" />}
          color="text-red-600"
        />
        <Info
          label="Bonus"
          value={driver.bonus || 0}
          icon={<ArrowUpCircle className="size-4 text-green-500" />}
          color="text-green-600"
        />
        <Info
          label="Penalty"
          value={driver.penalty || 0}
          icon={<MinusCircle className="size-4 text-orange-500" />}
          color="text-orange-600"
        />
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {/* Salary */}
        <button
          onClick={() => onSalary(driver)}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Wallet className="size-4" />
          Salary
        </button>

        {/* History */}
        <button
          onClick={() => onHistory(driver)}
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-slate-100"
        >
          <History className="size-4" />
          History
        </button>

        {/* Right actions */}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => onPrint(driver)}
            className="rounded-md border p-2 hover:bg-slate-100"
            title="Print Salary Slip"
          >
            <Printer className="size-4" />
          </button>

          <button
            onClick={() => onEdit(driver)}
            className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50 flex items-center gap-1"
            title="Edit Driver"
          >
            <Edit2 className="size-4" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

/* Small info block */
function Info({ label, value, icon, color }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-slate-500 text-xs">
        {icon}
        {label}
      </div>
      <p className={`mt-1 font-semibold ${color}`}>
        ₹ {value}
      </p>
    </div>
  );
}
