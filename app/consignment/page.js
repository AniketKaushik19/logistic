"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { generateConsignmentNumber } from "@/utils/generateCN";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { generatePDF } from "@/utils/generatePDF";
import Navbar from "../_components/Navbar";

/* ========= NUMBER VALIDATION PROPS ========= */
const numberOnlyProps = {
  min: 0,
  onKeyDown: (e) => {
    if (["e", "E", "-", "+"].includes(e.key)) {
      e.preventDefault();
    }
  },
};

export default function Page() {
  const [loading, setLoading] = useState(false);
  const search = useSearchParams();
  const router = useRouter();
  const editId = search.get("editId");
  const [cn, setCn] = useState(generateConsignmentNumber());
  const [isEdit, setIsEdit] = useState(false);
const [form, setForm] = useState({
  // Consignor
  consignorName: "",
  consignorAddress: "",
  consignorPhone: "",
  consignorCSTNo: "",

  // Consignee
  consigneeName: "",
  consigneeAddress: "",
  consigneePhone: "",
  consigneeCSTNo: "",
  deliveryAddress: "",

  // Route & Date
  fromLocation: "",
  toLocation: "",
  consignmentDate: "",

  // Goods
  goodsDescription: "",
  packageCount: "",
  packageMethod: "",

  // Weight & Rates
  weightActual: "",
  weightCharged: "",
  rateperkg: "",
  amount: "",

  // Invoice & Charges
  invoiceNo: "",
  invoiceValue: "",
  freight: "",
  riskCharge: "",
  surcharge: "",
  hamali: "",
  serviceCharge: "",
  paidAt: "",
  billedAt: "",
  measurement: "",
  // Tax / Declaration
  validUpTo: "",
  declarationDate: "",

  // Delivery
  deliveryRemarks: "",
  deliveryDate: "",

  // Vehicle & Driver
  vehicleNo: "",
  driverName: "",


  // Payment
  paymentType: "Paid",
});

  /* ========= AUTO AMOUNT ========= */
  useEffect(() => {
    const w = parseFloat(form.weightCharged) || 0;
    const r = parseFloat(form.rateperkg) || 0;
    const amt = (w * r).toFixed(2);
    setForm((p) => ({ ...p, amount: amt > 0 ? amt : "" }));
  }, [form.weightCharged, form.rateperkg]);

  /* populate when editing */
  useEffect(() => {
    if (!editId) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/consignment/${editId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!mounted) return;
        setForm((prev) => ({ ...prev, ...data }));
        if (data.cn) setCn(data.cn);
        setIsEdit(true);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load consignment for edit');
      }
    })();
    return () => { mounted = false };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "vehicleNo") value = value.toUpperCase();
    setForm({ ...form, [e.target.name]: value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;   // prevent double submit

  setLoading(true);
  const payload = { cn, ...form };

  try {
    if (isEdit && editId) {
      const res = await fetch(`/api/consignment/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        toast.error('Failed to update consignment');
        return;
      }
      await generatePDF(cn, payload);
      toast.success('Consignment updated & PDF generated');
      router.push('/consignment/list');
      return;
    }

    const res = await fetch("/api/consignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast.error("Failed to save consignment");
      return;
    }

    await generatePDF(cn, payload);
    toast.success("Consignment saved & PDF generated");
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);   // always reset
  }
 };
;

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
  className="max-w-4xl mx-auto space-y-10 bg-white p-8 rounded-xl shadow-lg"
>

{/* ================= CONSIGNOR ================= */}
<section>
  <h2 className="font-semibold text-lg mb-3">Consignor Details</h2>

  <div className="grid sm:grid-cols-2 gap-4">
    <input
      name="consignorName"
      required
      value={form.consignorName}
      onChange={handleChange}
      placeholder="Consignor Name"
      className="input"
    />

    <input
      name="consignorPhone"
      type="tel"
      pattern="[0-9]{10}"
      maxLength={10}
      required
      value={form.consignorPhone}
      onChange={handleChange}
      placeholder="Phone (10 digits)"
      className="input"
    />
  </div>

  <textarea
    name="consignorAddress"
    required
    value={form.consignorAddress}
    onChange={handleChange}
    placeholder="Consignor Address"
    className="input mt-3"
  />

  <input
    name="consignorCSTNo"
    value={form.consignorCSTNo}
    onChange={handleChange}
    placeholder="Consignor CST No (optional)"
    className="input mt-3"
  />
</section>

{/* ================= CONSIGNEE ================= */}
<section>
  <h2 className="font-semibold text-lg mb-3">Consignee Details</h2>

  <div className="grid sm:grid-cols-2 gap-4">
    <input
      name="consigneeName"
      required
      value={form.consigneeName}
      onChange={handleChange}
      placeholder="Consignee Name"
      className="input"
    />

    <input
      name="consigneePhone"
      type="tel"
      pattern="[0-9]{10}"
      maxLength={10}
      value={form.consigneePhone}
      onChange={handleChange}
      placeholder="Phone (optional)"
      className="input"
    />
  </div>

  <textarea
    name="consigneeAddress"
    required
    value={form.consigneeAddress}
    onChange={handleChange}
    placeholder="Consignee Address"
    className="input mt-3"
  />

  <textarea
    name="deliveryAddress"
    value={form.deliveryAddress}
    onChange={handleChange}
    placeholder="Delivery Address (if different)"
    className="input mt-3"
  />

  <input
    name="consigneeCSTNo"
    value={form.consigneeCSTNo}
    onChange={handleChange}
    placeholder="Consignee CST No (optional)"
    className="input mt-3"
  />
</section>

{/* ================= ROUTE ================= */}
<section>
  <h2 className="font-semibold text-lg mb-3">Route & Date</h2>

  <div className="grid sm:grid-cols-3 gap-4">
    <input
      name="fromLocation"
      required
      value={form.fromLocation}
      onChange={handleChange}
      placeholder="From"
      className="input"
    />
    <input
      name="toLocation"
      required
      value={form.toLocation}
      onChange={handleChange}
      placeholder="To"
      className="input"
    />
    <input
      name="consignmentDate"
      type="date"
      required
      value={form.consignmentDate?.split("T")[0] || ""}
      onChange={handleChange}
      className="input"
    />
  </div>
</section>

{/* ================= GOODS ================= */}
<section>
  <h2 className="font-semibold text-lg mb-3">Goods Details</h2>

  <input
    name="goodsDescription"
    required
    value={form.goodsDescription}
    onChange={handleChange}
    placeholder="Description (Said to contain)"
    className="input"
  />

  <div className="grid sm:grid-cols-4 gap-4 mt-3">
    <input
      name="packageCount"
      type="number"
      required
      {...numberOnlyProps}
      value={form.packageCount}
      onChange={handleChange}
      placeholder="Packages"
      className="input"
    />

    <select
      name="packageMethod"
      value={form.packageMethod}
      onChange={handleChange}
      className="input"
    >
      <option value="">Method</option>
      <option value="Carton">Carton</option>
      <option value="Bag">Bag</option>
      <option value="Drum">Drum</option>
      <option value="Loose">Loose</option>
    </select>

    <input
      name="weightActual"
      type="number"
      step="0.01"
      {...numberOnlyProps}
      value={form.weightActual}
      onChange={handleChange}
      placeholder="Weight (Actual)"
      className="input"
    />

    <input
      name="weightCharged"
      type="number"
      step="0.01"
      required
      {...numberOnlyProps}
      value={form.weightCharged}
      onChange={handleChange}
      placeholder="Weight (Charged)"
      className="input"
    />
  </div>
</section>

{/* ================= CHARGES ================= */}
<section>
  <h2 className="font-semibold text-lg mb-3">Charges</h2>

  <div className="grid sm:grid-cols-3 gap-4">
    <input
      name="rateperkg"
      type="number"
      step="0.01"
      required
      {...numberOnlyProps}
      value={form.rateperkg}
      onChange={handleChange}
      placeholder="Rate / Kg"
      className="input"
    />

    <input
      name="amount"
      value={form.amount}
      disabled
      placeholder="Auto Calculated Amount"
      className="input bg-gray-100"
    />

    <input
      name="freight"
      type="number"
      step="0.01"
      {...numberOnlyProps}
      value={form.freight}
      onChange={handleChange}
      placeholder="Freight"
      className="input"
    />
  </div>
</section>

{/* ================= VEHICLE ================= */}
<section>
  <h2 className="font-semibold text-lg mb-3">Vehicle</h2>

  <div className="grid sm:grid-cols-3 gap-4">
      <input
      name="vehicleNo"
      value={form.vehicleNo}
      onChange={handleChange}
      placeholder="Vehicle No"
      className="input"
    />
    <input
      name="driverName"
      value={form.driverName}
      onChange={handleChange}
      placeholder="Driver Name"
      className="input"
    />
  </div>
</section>

{/* ================= INVOICE & CHARGES ================= */}
<section>
  <h2 className="font-semibold text-lg mb-3">Invoice & Charges</h2>
  <div className="grid grid-cols-2 gap-4">
    <input
      type="text"
      name="invoiceNo"
      placeholder="Enter Invoice No"
      value={form.invoiceNo}
      onChange={handleChange}
      className="input"
    />

    <input
      type="text"
      name="invoiceValue"
      placeholder="Enter Invoice Value"
      value={form.invoiceValue}
      onChange={handleChange}
      className="input"
    />

    <input
      type="text"
      name="freight"
      placeholder="Enter Freight"
      value={form.freight}
      onChange={handleChange}
      className="input"
    />

    <input
      type="text"
      name="riskCharge"
      placeholder="Enter Risk Charge"
      value={form.riskCharge}
      onChange={handleChange}
      className="input"
    />

    <input
      type="text"
      name="surcharge"
      placeholder="Enter Surcharge"
      value={form.surcharge}
      onChange={handleChange}
      className="input"
    />

    <input
      type="text"
      name="hamali"
      placeholder="Enter Hamali"
      value={form.hamali}
      onChange={handleChange}
      className="input"
    />

    <input
      type="text"
      name="serviceCharge"
      placeholder="Enter Service Charge"
      value={form.serviceCharge}
      onChange={handleChange}
      className="input"
    />
        <input
      type="text"
      name="measurement"
      placeholder="Enter Measurement"
      value={form.measurement}
      onChange={handleChange}
      className="input"
    />
<div>
    <input
      type="date"
      name="paidAt"
      placeholder="Select Paid Date"
      value={form.paidAt}
      onChange={handleChange}
      className="input"
    />
<small className="px-2 text-gray-500">Select Paid Date</small>

</div>
<div>
    <input
      type="date"
      name="billedAt"
      placeholder="Select Billed Date"
      value={form.billedAt}
      onChange={handleChange}
      className="input"
    />
<small className="px-2 text-gray-500">Select Billed Date</small>
</div>
  </div>
</section>

{/* ================= TAX / DECLARATION ================= */}
<section>
  <h2 className="font-semibold text-lg mb-3">Tax / Declaration</h2>
  <div className="grid grid-cols-2 gap-4">
    <div>

    <input
      type="date"
      name="validUpTo"
      placeholder="Select Valid Upto Date"
      value={form.validUpTo}
      onChange={handleChange}
      className="input"
      />
    <small className="px-2 text-gray-500">Select Valid Upto Date</small>

      </div>
      <div>
    <input
      type="date"
      name="declarationDate"
      placeholder="Select Declaration Date"
      value={form.declarationDate}
      onChange={handleChange}
      className="input"
    />
    <small className="px-2 text-gray-500">Select Declaration Date</small>
      </div>
  </div>
</section>

{/* ================= DELIVERY ================= */}
<section>
  <h2 className="font-semibold text-lg mb-3">Delivery</h2>
  <div className="grid grid-cols-2 gap-4">
    <input
      type="text"
      name="deliveryRemarks"
      placeholder="Enter Delivery Remarks"
      value={form.deliveryRemarks}
      onChange={handleChange}
      className="input"
    />

    <input
      type="date"
      name="deliveryDate"
      placeholder="Select Delivery Date"
      value={form.deliveryDate}
      onChange={handleChange}
      className="input"
    />
  </div>
</section>
{/* ================= PAYMENT ================= */}
<section>
  <h2 className="font-semibold text-lg mb-3">Payment</h2>

  <select
    name="paymentType"
    required
    value={form.paymentType}
    onChange={handleChange}
    className="input"
  >
    <option value="Paid">Paid</option>
    <option value="To Pay">To Pay</option>
    <option value="Billing">Billing</option>
  </select>
</section>

         <motion.button
  whileHover={!loading ? { scale: 1.05 } : {}}
  disabled={loading}
  className={`w-full py-3 rounded-lg font-bold transition
    ${loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-red-600 hover:bg-red-700 text-white"}
  `}
  type="submit"
>
  {loading ? "Processing..." : "Save & Generate PDF"}
</motion.button>

        </form>
      </div>
    </>
  );
}
