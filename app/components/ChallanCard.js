"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, User, MapPin, IndianRupee , Edit , Printer , Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Loader2 as LoadingIcon } from "lucide-react";

export default function ChallanCard({ data }) {
  const f=data.freight
  const id=f._id
  const [isPaid, setIsPaid] = useState(f?.status === "Paid");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPaidAt, setCurrentPaidAt] = useState(f?.paidAt || null);

  const handlePaymentToggle = async (checked, selectedDate = null) => {
    try {
      setIsUpdating(true);
      const newStatus = checked ? "Paid" : "Pending";
      
      const response = await fetch("/api/freight", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          freightId: id,
          status: newStatus,
          paidAt: selectedDate,
        }),
      });

      if (response.ok) {
        setIsPaid(checked);
        if (checked && selectedDate) {
          setCurrentPaidAt(selectedDate);
        } else {
          setCurrentPaidAt(null);
        }
        setShowDatePicker(false);
      } else {
        console.error("Failed to update payment status");
        alert("Failed to update payment status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Error updating payment status");
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (



<Card
  className="
    w-76
    rounded-2xl
    border-0 ring-0
    bg-white
    shadow-[0_8px_24px_rgba(0,0,0,0.12)]
    transition-all duration-300
    md:hover:shadow-[0_24px_48px_rgba(0,0,0,0.18)]
  "
>
      {/* Header */}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-sm">
            Challan No: {f.challanNo}
          </p>
          <Badge variant="secondary">{f.date}</Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-3 text-sm">
        {/* Route */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin size={16} />
          <span>{f.from} → {f.to}</span>
        </div>

        {/* Vehicle & Driver */}
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-1">
            <Truck size={14} /> {f.lorryNo}
          </div>
          <div className="flex items-center gap-1">
            <User size={14} /> {f.driverName}
          </div>
        </div>

        {/* GR Numbers */}
        <div className="text-xs text-muted-foreground">
          GR Nos: {f.grNos.join(", ")}
        </div>

        {/* Amount */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-xs">
            {isPaid ? (
              <span className="text-green-600 font-semibold flex flex-col text-left">
                <span>✓ Paid</span>
                {(currentPaidAt || isPaid) && (
                  <span className="text-[10px] text-gray-500 font-normal mt-0.5 whitespace-nowrap">
                    Paid on {new Date(currentPaidAt || new Date()).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                )}
              </span>
            ) : (
              <>Advance: ₹{f.advance || 0}</>
            )}
          </div>
          <div className="flex items-center gap-1 font-bold">
            <IndianRupee size={16} />
            {isPaid ? f.total : f.netBalance}
          </div>
        </div>

        {/* Payment Checkbox */}
        {!isPaid ? (
          <div className="flex flex-col gap-2 py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`payment-${id}`}
                checked={showDatePicker}
                onChange={(e) => setShowDatePicker(e.target.checked)}
                disabled={isUpdating}
                className="w-4 h-4 cursor-pointer accent-green-600 disabled:opacity-50"
              />
              <label htmlFor={`payment-${id}`} className="text-xs font-medium text-gray-700 cursor-pointer flex items-center gap-1">
                Mark as Payment Done
              </label>
            </div>

            {showDatePicker && (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-200 text-left">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Select Payment Date</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className="flex-1 text-xs border rounded-lg p-1.5 focus:ring-1 focus:ring-green-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handlePaymentToggle(true, paidDate)}
                    disabled={isUpdating}
                    className="bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-green-700 disabled:opacity-50 hover:cursor-pointer flex items-center gap-1"
                  >
                    {isUpdating && <LoadingIcon size={10} className="animate-spin" />}
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 px-3 bg-green-50 text-green-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <span>✓ Payment Completed</span>
          </div>
        )}

        {/* Payable */}
        <p className="text-xs text-right text-muted-foreground">
          Payable at: {f.payableAt}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Link href={`/freightMemo/editFreight/${id}`}>
            <button
              className="rounded-xl bg-amber-100 text-amber-700 px-3 py-2 hover:bg-amber-200 transition flex items-center gap-1 hover:cursor-pointer"
              title="Edit"
            >
              <Edit size={16} />
              Edit
            </button>
          </Link>

          <button
            onClick={() =>data.handlePrint(f) }
            className="rounded-xl bg-blue-100 text-blue-700 px-3 py-2 hover:bg-blue-200 transition flex items-center gap-1 hover:cursor-pointer"
            title="Print"
          >
            <Printer size={16} />
            Print
          </button>

          <button
            onClick={() =>data.handleDelete(f._id) }
            className="rounded-xl bg-red-100 text-red-700 px-3 py-2 hover:bg-red-200 transition flex items-center gap-1 hover:cursor-pointer"
            title="Delete"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
