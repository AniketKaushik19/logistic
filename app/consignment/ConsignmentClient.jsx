"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { generatePDF } from "@/utils/generatePDF";
import Navbar from "../_components/Navbar";
import { printPDF } from "@/utils/printPDF";
import { authFetch } from "@/lib/authFetch";
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
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const search = useSearchParams();
  const router = useRouter();
  const editId = search.get("editId");
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
    fax: "",

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

    //consignee form filler name
    yourName: "Suresh Kumar",
  });
  const [onlysave, setOnlySave] = useState(false);

useEffect(() => {
  const weight = parseFloat(form.weightCharged) || 0;
  const rate = parseFloat(form.rateperkg) || 0;

  // List of optional charges
  const charges = ["freight", "riskCharge", "surcharge", "hamali", "serviceCharge"];
  const extra = charges.reduce((sum, field) => sum + (parseFloat(form[field]) || 0), 0);

  const total = weight * rate + extra;

  setForm((prev) => ({
    ...prev,
    amount: total > 0 ? total.toFixed(2) : "",
  }));
}, [
  form.weightCharged,
  form.rateperkg,
  form.freight,
  form.riskCharge,
  form.surcharge,
  form.hamali,
  form.serviceCharge,
]);


  /* ========= POPULATE EDIT ========= */
 useEffect(() => {
  if (!editId) return;

  let mounted = true;

  (async () => {
    try {
      const res = await authFetch(`/api/consignment/${editId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        toast.error("Failed to load consignment");
        return;
      }

      const data = await res.json();

      if (!mounted) return;

      setForm((prev) => ({ ...prev, ...data }));
      setIsEdit(true);
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  })();

  return () => {
    mounted = false;
  };
}, [editId]);


  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "vehicleNo") value = value.toUpperCase();
    setForm({ ...form, [e.target.name]: value });
  };

  /* ========= SUBMIT ========= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading1 || loading2) return;
    if (onlysave) setLoading1(true);
    else setLoading2(true);
    const token = localStorage.getItem("auth_token");
    try {
      if (isEdit && editId) {
        const res = await fetch(`/api/consignment/${editId}`, {
          method: "PUT",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });

  if (!res) {
      throw new Error("Server Down");
    }
        const data = await res.json();
        const cn = data?.data?.cn || form.cn;

        if (!onlysave) {
          await printPDF(cn, { ...form, cn });
          toast.success("Consignment saved & PDF generated");
        } else {
          toast.success("Consignment saved");
        }

        router.push("/consignment/list");
        return;
      }

      const res = await fetch("/api/consignment", {
        method: "POST",
        cache: "no-store",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res) return;

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Failed to save consignment");
        return;
      }

      const cn = data?.cn;
      if (!cn) {
        toast.error("Failed to generate Consignment Number");
        return;
      }

      if (!onlysave) {
        await printPDF(cn, { ...form, cn });
        toast.success("Consignment saved & PDF generated");
      } else {
        toast.success("Consignment saved");
      }
      router.push("/consignment/list");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading1(false);
      setLoading2(false);
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
                value={form.consignorPhone}
                onChange={handleChange}
                placeholder="Phone (10 digits)"
                className="input"
              />
            </div>

            <textarea
              name="consignorAddress"
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
                value={form.fromLocation}
                onChange={handleChange}
                placeholder="From"
                className="input"
              />
              <input
                name="toLocation"
                value={form.toLocation}
                onChange={handleChange}
                placeholder="To"
                className="input"
              />
              <input
                name="consignmentDate"
                type="date"
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
              value={form.goodsDescription}
              onChange={handleChange}
              placeholder="Description (Said to contain)"
              className="input"
            />
          

            <div className="grid sm:grid-cols-4 gap-4 mt-3">
                <input
              name="fax"
              value={form.fax}
              onChange={handleChange}
              placeholder="Fax"
              className="input"
            />
              <input
                name="packageCount"
                type="number"
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
                <small className="px-2 text-gray-500">
                  Select Valid Upto Date
                </small>
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
                <small className="px-2 text-gray-500">
                  Select Declaration Date
                </small>
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
            <div className="grid grid-cols-2 gap-5">
              <select
                name="paymentType"
                value={form.paymentType}
                onChange={handleChange}
                className="input"
              >
                <option value="Paid">Paid</option>
                <option value="To Pay">To Pay</option>
                <option value="Billing">Billing</option>
              </select>
              <input
                type="text"
                name="yourName"
                placeholder="Enter Your Name"
                value={form.yourName}
                onChange={handleChange}
                className="input"
              />
            </div>
          </section>

          <div className="flex gap-5">
            <motion.button
              whileHover={!loading1 ? { scale: 1.05 } : {}}
              disabled={loading1}
              onClick={() => {
                setOnlySave(true);
              }}
              className={`w-full py-3 rounded-lg font-bold transition
    ${
      loading1
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-600 hover:bg-red-700 text-white"
    }
  `}
              type="submit"
            >
              {loading1 ? "Processing..." : "Save"}
            </motion.button>
            <motion.button
              whileHover={!loading2 ? { scale: 1.05 } : {}}
              disabled={loading2}
              className={`w-full py-3 rounded-lg font-bold transition
    ${
      loading2
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-600 hover:bg-red-700 text-white"
    }
  `}
              type="submit"
            >
              {loading2 ? "Processing..." : "Save & Print PDF"}
            </motion.button>
          </div>
        </form>
      </div>
    </>
  );
}
