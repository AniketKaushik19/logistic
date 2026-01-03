"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Printer } from "lucide-react";
import Navbar from "../_components/Navbar";
import toast from "react-hot-toast";
import Link from "next/link";
import { BillPDF } from "../components/BillPDF";
import { pdf } from "@react-pdf/renderer";
export default function EBillsDashboard() {
  const [ebill, setEbill] = useState([]);

  const handleEdit = async(billNo) => alert(`Editing ${billNo}`);
  const handlePrint = async (bill) => {
      const blob = await pdf(<BillPDF bill={bill} />).toBlob();
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url);
      if (newWindow) {
        newWindow.onload = () => {
        newWindow.print(); // trigger browser print dialog
        };
      }
};

  const getEbill = async () => {
    const token = localStorage.getItem("auth_token");
    try {
      const response = await fetch("/api/e-bill", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      const {data} = await response.json();
      setEbill(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch bills");
      console.log("Error in getting ebill:", error);
    }
  };

  const handleDelete=async(_id)=>{
    const token = localStorage.getItem("auth_token");
    try {
      const response = await fetch("/api/e-bill", {
        cache: "no-store",
        method:"DELETE",
        headers: { Authorization: `Bearer ${token}`,
      },
      body:JSON.stringify({_id})
      });
      const data = await response.json();
      console.log(data)
      if(data){
        toast.success("E-bill deleted successfully!!")
        getEbill()
      }
      else{
        toast.error(data.error)
      }
    } catch (error) {
      toast.error("Failed to delete bills");
      console.log("Error in deleting Ebill:", error);
    }
  }

  useEffect(() => {
    getEbill();
  }, []);

  return (<>
    <Navbar />
    <div className="p-6 bg-slate-100 min-h-screen mt-16">
      <button className="bg-green-500 rounded-2xl p-3  font-semibold hover:bg-green-600 hover:cursor-pointer text-white font-semibold">
          <Link href={`e-bill/addE-bill`}>Add E-bill</Link>
        </button>
      {/* Responsive grid for better alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-16">
        {ebill.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">No bills found</p>
        ) : (
          ebill.map((b, i) => (
            <Card
              key={i}
              className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white w-full"
            >
              <CardHeader className="p-2 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg text-slate-800">{b.customer}</p>
                    <p className="text-sm text-slate-500">
                      {b.billNo} • {b.billDate}
                    </p>
                  </div>
                  <p className="font-bold text-indigo-600 text-lg">₹{b.grandTotal}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm p-2">
                <p className="text-slate-700">
                  <span className="font-medium">Address:</span> {b.customerAddress}
                </p>

                {b.consignments?.map((c, j) => (
                  <div
                    key={j}
                    className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2 border"
                  >
                    <span className="text-slate-600">{c.from} → {c.to}</span>
                    <span className="font-semibold text-slate-800">₹{c.total}</span>
                  </div>
                ))}

                {/* Action buttons aligned to the right */}
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    size="icon"
                    className="bg-amber-500 text-white h-9 w-9 rounded-full shadow hover:scale-105 transition"
                    variant="outline"
                    onClick={() => handleEdit(b)}
                  >
                    <Edit size={18} />
                  </Button>
                  {/* <Button
                    size="icon"
                    className="bg-blue-500 text-white h-9 w-9 rounded-full shadow hover:scale-105 transition"
                    variant="outline"
                    onClick={() => handlePrint(b)}
                  >
                    <Printer size={18} />
                  </Button> */}
                  <Button
                    size="icon"
                    className="bg-red-500 text-white h-9 w-9 rounded-full shadow hover:scale-105 transition"
                    variant="destructive"
                    onClick={() => handleDelete(b._id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
     </>
  );
}