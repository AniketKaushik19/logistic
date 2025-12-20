"use client";

import { useState, useEffect } from "react";
import { generateConsignmentNumber } from "@/utils/generateCN";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { generatePDF } from "@/utils/generatePDF";
import Navbar from "../_components/Navbar";

export default function Page() {
  const [cn] = useState(generateConsignmentNumber());

  const [form, setForm] = useState({
    consignorName: "",
    consignorAddress: "",
    consignorPhone: "",
    consigneeName: "",
    consigneeAddress: "",
    consigneePhone: "",
    deliveryAddress: "",

    fromLocation: "",
    toLocation: "",
    consignmentDate: "",

    consignorCSTNo: "",
    consigneeCSTNo: "",
    invoiceNo: "",
    invoiceValue: "",

    packageCount: "",
    packageMethod: "",
    packageDescription: "",

    goodsDescription: "",

    weightActual: "",
    weightCharged: "",
    rateperkg: "",
    amount: "",

    freight: "",
    lorryNo: "",
    vehicleNo: "",
    driverName: "",

    paymentType: "Paid",
  });

  // auto amount
  useEffect(() => {
    const w = parseFloat(form.weightCharged) || 0;
    const r = parseFloat(form.rateperkg) || 0;
    const amt = (w * r).toFixed(2);
    setForm((p) => ({ ...p, amount: amt > 0 ? amt : "" }));
  }, [form.weightCharged, form.rateperkg]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "vehicleNo") value = value.toUpperCase();
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { cn, ...form };

    try {
      const res = await fetch("/api/consignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Failed to save consignment");
        return;
      }

      generatePDF(cn, payload);
      toast.success("Consignment saved & PDF generated");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 pb-20 px-6 bg-white">
        <Toaster />
        <h1 className="text-3xl font-bold text-center mb-2">
          Create Consignment Note
        </h1>
        <p className="text-center text-gray-600 mb-6">
          CN No: <span className="font-semibold text-red-600">{cn}</span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-lg"
        >
          {/* CONSIGNOR */}
          <section>
            <h2 className="font-semibold mb-3">Consignor</h2>
            <input name="consignorName" onChange={handleChange} placeholder="Name" className="input" />
            <input name="consignorPhone" onChange={handleChange} placeholder="Phone" className="input mt-2" />
            <textarea name="consignorAddress" onChange={handleChange} placeholder="Address" className="input mt-2" />
          </section>

          {/* CONSIGNEE */}
          <section>
            <h2 className="font-semibold mb-3">Consignee</h2>
            <input name="consigneeName" onChange={handleChange} placeholder="Name" className="input" />
            <input name="consigneePhone" onChange={handleChange} placeholder="Phone" className="input mt-2" />
            <textarea name="consigneeAddress" onChange={handleChange} placeholder="Address" className="input mt-2" />
            <textarea name="deliveryAddress" onChange={handleChange} placeholder="Delivery Address" className="input mt-2" />
          </section>

          {/* ROUTE */}
          <section className="grid sm:grid-cols-3 gap-4">
            <input name="fromLocation" onChange={handleChange} placeholder="From" className="input" />
            <input name="toLocation" onChange={handleChange} placeholder="To" className="input" />
            <input name="consignmentDate" type="date" onChange={handleChange} className="input" />
          </section>

          {/* GOODS */}
          <section>
            <input name="goodsDescription" onChange={handleChange} placeholder="Description (Said to contain)" className="input" />
            <div className="grid sm:grid-cols-4 gap-4 mt-3">
              <input name="packageCount" onChange={handleChange} placeholder="Packages" className="input" />
              <input name="packageMethod" onChange={handleChange} placeholder="Method" className="input" />
              <input name="weightActual" onChange={handleChange} placeholder="Weight (Actual)" className="input" />
              <input name="weightCharged" onChange={handleChange} placeholder="Weight (Charged)" className="input" />
            </div>
          </section>

          {/* CHARGES */}
          <section className="grid sm:grid-cols-3 gap-4">
            <input name="rateperkg" onChange={handleChange} placeholder="Rate / Kg" className="input" />
            <input name="amount" value={form.amount} disabled className="input bg-gray-100" />
            <input name="freight" onChange={handleChange} placeholder="Freight" className="input" />
          </section>

          {/* VEHICLE */}
          <section className="grid sm:grid-cols-3 gap-4">
            <input name="lorryNo" onChange={handleChange} placeholder="Lorry No" className="input" />
            <input name="vehicleNo" onChange={handleChange} placeholder="Vehicle No" className="input" />
            <input name="driverName" onChange={handleChange} placeholder="Driver" className="input" />
          </section>

          {/* PAYMENT */}
          <select name="paymentType" onChange={handleChange} className="input">
            <option>Paid</option>
            <option>To Pay</option>
            <option>Billing</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold"
            type="submit"
          >
            Save & Generate PDF
          </motion.button>
        </form>
      </div>
    </>
  );
}
