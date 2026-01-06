"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import Navbar from '../_components/Navbar'
import ChallanCard from '../components/ChallanCard'
import toast from 'react-hot-toast'
import { pdf } from '@react-pdf/renderer'
import FreightMemoPDF from '../components/FreightMemo'
const page = () => {
  const [freight , setFreight]=useState([])
  const getFreight=async()=>{
       try {
      const res = await fetch("/api/freight", { cache: "no-store" });
      const json = await res.json();
      setFreight(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      toast.error("Failed to fetch freight");
      console.error(err);
    }
  }

  const handleDelete=async(_id)=>{
       try {
      const res = await fetch("/api/freight", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success("Freight deleted successfully");
      getFreight();
    } catch (err) {
      toast.error("Failed to delete freight");
      console.error(err);
    }
  }

  const handlePrint=async(freight)=>{
     const blob = await pdf(<FreightMemoPDF data={freight} />).toBlob();
        const url = URL.createObjectURL(blob);
        const win = window.open(url);
        if (win) win.onload = () => win.print();
  }
  useEffect(()=>{
     getFreight()
  },[])

  return (
    <div className="min-h-screen bg-slate-100 p-6 mt-16">
      {/* //Header  */}
      <Navbar />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Freight Dashboard
        </h1>
        <Link href="/freightMemo/addFreight">
          <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-white font-semibold shadow-lg hover:shadow-2xl transition">
            <Plus className="size-4" />
            Freight
          </button>
        </Link>
      </div>

      {/* //Dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  m-10">
  {freight.length > 0 ? (
    freight.map((item, i) => (
      <ChallanCard
        key={item.id || i}
        data={{
          freight: item,
          handleDelete,
          handlePrint,
        }}
      />
    ))
  ) : (
    <p className="col-span-full text-center text-gray-500">
      No freight records found
    </p>
  )}
</div>
    </div>
  )
}

export default page