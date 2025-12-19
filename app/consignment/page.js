"use client";
import { useState, useEffect } from "react";
import { generateConsignmentNumber } from "@/utils/generateCN";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { generatePDF } from "@/utils/generatePDF";
import Navbar from "../_components/Navbar";

export default function Page() {
  const [cn] = useState(generateConsignmentNumber());
  const router = useRouter();
  const [form, setForm] = useState({
    consignorName: "",
    consignorAddress: "",
    consignorPhone: "",
    consignorFax: "",
    consigneeName: "",
    consigneeAddress: "",
    deliveryAddress: "",
    consigneePhone: "",
    consignorCSTNo: "",
    consigneeCSTNo: "",
    goodsDescription: "",
    weight: "",
    rateperkg: "",
    amount: "",
    packageCount: "",
    packageMethod: "",
    packageDescription: "",
    invoiceValue: "",
    freight: "",
    lorryNo: "",
    driverName: "",
    fromLocation: "",
    toLocation: "",
    consignmentDate: "",
    vehicleNo: "",
    paymentType: "Paid",
    // fields used in PDF
    gstin: "",
    pan: "",
    routeCode: "",
    paymentResponsibility: "",
    salesTaxDeclaration: "",
    validUpTo: "",
    taxDate: "",
    invoiceNo: "",
    measurement: "",
    paidAt: "",
    weightActual: "",
    weightCharged: "",
    billedAt: "",
    riskCharge: "",
    surcharge: "",
    hamali: "",
    serviceValue: "",
    totalAmount: "",
    deliveryDate: "",
  });

  // Auto-calculate amount based on weight and rate per kg
  useEffect(() => {
    const weight = parseFloat(form.weight) || 0;
     const ratePerKg = parseFloat(form.rateperkg) || 0;
    const calculatedAmount = (weight * ratePerKg).toFixed(2);
    setForm((prev) => ({
      ...prev,
      amount: calculatedAmount > 0 ? calculatedAmount : "",
    }));
  }, [form.weight, form.rateperkg]);

  const handleChange = (e) => {
    let value = e.target.value;
    // Convert vehicle number to uppercase
    if (e.target.name === "vehicleNo") {
      value = value.toUpperCase();
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { cn, ...form };

    try {
      // 1️⃣ SAVE TO MONGODB (API)
      const res = await fetch("/api/consignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Failed to save consignment");
        console.log(res);
        return;
      }

     
      generatePDF(cn,payload)
      console.log("Consignment Saved:", payload);
      toast.success("Consignment saved & PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (<>
  <Navbar/>
    <div className="pt-20 bg-white pb-20  px-6 w-full">
      <Toaster position="top-right" reverseOrder={false} />
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold mb-4 bg-linear-to-r from-red-600 to-rose-500 bg-clip-text text-transparent text-center"
      >
        Create Consignment
      </motion.h1>

      <p className="mb-8 text-slate-600 text-center font-semibold">
        Consignment Note Number:{" "}
        <span className="text-rose-600 text-lg">{cn}</span>
        
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white shadow-2xl rounded-3xl p-10 max-w-4xl mx-auto border border-gray-100"
      >
        {/* CONSIGNOR */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b-2 border-rose-500">
            📦 Consignor Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <input
              name="consignorName"
              onChange={handleChange}
              placeholder="Consignor Name"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
              
            />
            <input
              name="consignorPhone"
              onChange={handleChange}
              placeholder="Phone Number"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
              
            />
            <input
              name="consignorFax"
              onChange={handleChange}
              placeholder="Fax"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <textarea
              name="consignorAddress"
              onChange={handleChange}
              placeholder="Address"
              rows="3"
              className="px-4 py-3 sm:col-span-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
          </div>
        </section>

        {/* CONSIGNEE */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b-2 border-rose-500">
            🚚 Consignee Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <input
              name="consigneeName"
              onChange={handleChange}
              placeholder="Consignee Name"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
              
            />
            <input
              name="consigneePhone"
              onChange={handleChange}
              placeholder="Phone Number"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
              
            />
            <textarea
              name="consigneeAddress"
              onChange={handleChange}
              placeholder="Consignee Address"
              rows="3"
              className="px-4 py-3 sm:col-span-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <textarea
              name="deliveryAddress"
              onChange={handleChange}
              placeholder="Delivery / Delivery Address (for PDF)"
              rows="2"
              className="px-4 py-3 sm:col-span-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
          </div>
        </section>

        {/* SHIPMENT / ADDITIONAL DETAILS */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b-2 border-rose-500">
            📝 Shipment Details
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <input
              name="consignmentDate"
              onChange={handleChange}
              placeholder="Consignment Date"
              type="date"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="fromLocation"
              onChange={handleChange}
              placeholder="From (Location)"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="toLocation"
              onChange={handleChange}
              placeholder="To (Location)"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="consignorCSTNo"
              onChange={handleChange}
              placeholder="Consignor CST No"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="consigneeCSTNo"
              onChange={handleChange}
              placeholder="Consignee CST No"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="packageCount"
              onChange={handleChange}
              placeholder="Packages (count)"
              type="number"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="invoiceValue"
              onChange={handleChange}
              placeholder="Invoice Value"
              type="number"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="freight"
              onChange={handleChange}
              placeholder="Freight"
              type="number"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="lorryNo"
              onChange={handleChange}
              placeholder="Lorry No"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="driverName"
              onChange={handleChange}
              placeholder="Driver Name"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="packageDescription"
              onChange={handleChange}
              placeholder="Package Description (said to contain)"
              className="px-4 py-3 sm:col-span-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="packageMethod"
              onChange={handleChange}
              placeholder="Package Method"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="invoiceNo"
              onChange={handleChange}
              placeholder="Invoice No."
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="measurement"
              onChange={handleChange}
              placeholder="Measurement"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
          </div>
        </section>

        {/* GOODS */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b-2 border-rose-500">
            📋 Goods Details
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <input
              name="goodsDescription"
              onChange={handleChange}
              placeholder="Description of Goods"
              className="px-4 py-3 sm:col-span-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="weight"
              onChange={handleChange}
              placeholder="Weight (kg)"
              type="number"
              step="0.01"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="rateperkg"
              onChange={handleChange}
              placeholder="Rate per kg"
              type="number"
              step="0.01"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
            <input
              name="amount"
              value={form.amount}
              disabled
              placeholder="Amount (Auto-calculated)"
              type="number"
              className="px-4 py-3 rounded-xl border-2 border-green-300 bg-green-50 shadow-sm text-green-700 font-semibold cursor-not-allowed"
            />
            <input
              name="vehicleNo"
              onChange={handleChange}
              placeholder="Vehicle Number"
              className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-200"
            />
          </div>
        </section>

        {/* TAX & DECLARATION */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b-2 border-rose-500">🧾 Tax & Declaration</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <input name="gstin" onChange={handleChange} placeholder="GSTIN" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="pan" onChange={handleChange} placeholder="PAN" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="routeCode" onChange={handleChange} placeholder="Route Code" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="paymentResponsibility" onChange={handleChange} placeholder="Control Will Be Paid By" className="px-4 py-3 rounded-xl border border-gray-200 sm:col-span-3" />
            <input name="salesTaxDeclaration" onChange={handleChange} placeholder="Sales Tax / Declaration" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="validUpTo" onChange={handleChange} placeholder="Valid Up To" type="date" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="taxDate" onChange={handleChange} placeholder="Tax Date" type="date" className="px-4 py-3 rounded-xl border border-gray-200" />
          </div>
        </section>

        {/* INVOICE & CHARGES */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b-2 border-rose-500">💰 Invoice & Charges</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <input name="paidAt" onChange={handleChange} placeholder="Paid at" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="weightActual" onChange={handleChange} placeholder="Weight (Actual)" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="weightCharged" onChange={handleChange} placeholder="Weight (Charged)" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="billedAt" onChange={handleChange} placeholder="Billed at" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="riskCharge" onChange={handleChange} placeholder="Risk Charge" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="surcharge" onChange={handleChange} placeholder="Surcharge" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="hamali" onChange={handleChange} placeholder="Hamali" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="serviceValue" onChange={handleChange} placeholder="Service Value" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="totalAmount" onChange={handleChange} placeholder="Total Amount" className="px-4 py-3 rounded-xl border border-gray-200" />
            <input name="deliveryDate" onChange={handleChange} placeholder="Delivery Date" type="date" className="px-4 py-3 rounded-xl border border-gray-200" />
          </div>
        </section>

        {/* PAYMENT */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b-2 border-rose-500">
            💳 Payment Details
          </h2>
          <select
            name="paymentType"
            onChange={handleChange}
            className="px-4 py-3 w-full sm:w-full rounded-xl border-2 border-gray-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition duration-200 text-gray-800 font-semibold bg-white cursor-pointer"
          >
            <option value="Paid" className="text-gray-800">✓ Paid</option>
            <option value="To Pay" className="text-gray-800">⏳ To Pay</option>
            <option value="Billing" className="text-gray-800">📋 Billing</option>
          </select>
        </section>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-linear-to-r from-red-600 to-rose-500 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl font-bold text-lg transition duration-200"
          type="submit"
        >
          ✓ Save & Generate Consignment
        </motion.button>
      </form>
    </div>
      </>

  );
}
