"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, User, MapPin, IndianRupee , Edit , Printer , Trash2 } from "lucide-react";
import Link from "next/link";
export default function ChallanCard({ data }) {
  const f=data.freight
  const id=f._id
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
            Advance: ₹{f.advance || 0}
          </div>
          <div className="flex items-center gap-1 font-bold">
            <IndianRupee size={16} />
            {f.netBalance}
          </div>
        </div>

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
