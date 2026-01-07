"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import Navbar from '../_components/Navbar'
import ChallanCard from '../components/ChallanCard'
import toast from 'react-hot-toast'
import { pdf } from '@react-pdf/renderer'
import FreightMemoPDF from '../components/FreightMemo'

const Page = () => {
  const [freight, setFreight] = useState([])

  const getFreight = async () => {
    try {
      const res = await fetch("/api/freight", { cache: "no-store" });
      const json = await res.json();
      setFreight(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      toast.error("Failed to fetch freight");
      console.error(err);
    }
  }

  const handleDelete = async (_id) => {
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

  const handlePrint = async (freight) => {
    const blob = await pdf(<FreightMemoPDF data={freight} />).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (win) win.onload = () => win.print();
  }

  useEffect(() => {
    getFreight()
  }, [])

  return (
   <div className="min-h-screen bg-slate-100 px-3 sm:px-6 lg:px-10 py-4 sm:py-6 mt-16">
  {/* Header */}
  <Navbar />

  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
    <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-800 text-center sm:text-left">
      Freight Dashboard
    </h1>

    <Link href="/freightMemo/addFreight">
      <button className="
        flex items-center justify-center gap-2
        rounded-xl bg-purple-600
        px-4 py-2 sm:px-5 sm:py-2.5
        text-sm sm:text-base
        text-white font-semibold
        shadow-md hover:shadow-xl
        transition
        w-full sm:w-auto
      ">
        <Plus className="h-4 w-4" />
        Add Freight
      </button>
    </Link>
  </div>

  {/* Dashboard Grid */}
  <div
    className="
      grid gap-4
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      xl:grid-cols-4
    "
  >
    {freight.length > 0 ? (
      freight.map((item, i) => (
        <ChallanCard
          key={item.id || i}
          data={{ freight: item, handleDelete, handlePrint }}
        />
      ))
    ) : (
      <div className="col-span-full py-10 text-center text-gray-500 text-sm sm:text-base">
        No freight records found
      </div>
    )}
  </div>
</div>

  )
}

export default Page