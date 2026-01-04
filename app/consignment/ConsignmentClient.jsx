"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../_components/Navbar";
import { printPDF } from "@/utils/printPDF";

/* ========= NUMBER VALIDATION ========= */
const numberOnlyProps = {
  min: 0,
  onKeyDown: (e) => {
    if (["e", "E", "-", "+"].includes(e.key)) e.preventDefault();
  },
};

/* ========= INITIAL FORM ========= */
const INITIAL_FORM = {
  consignorName: "",
  consignorAddress: "",
  consignorPhone: "",
  consignorCSTNo: "",

  consigneeName: "",
  consigneeAddress: "",
  consigneePhone: "",
  consigneeCSTNo: "",
  deliveryAddress: "",

  fromLocation: "",
  toLocation: "",
  consignmentDate: "",

  goodsDescription: "",
  packageCount: "",
  packageMethod: "",
  fax: "",

  amountType: "fixed",
  weightActual: "fixed",
  weightCharged: "fixed",
  rateperkg: "fixed",
  amount: "",
  tempAmount: "",

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

  ebayBill: "",
  declarationDate: "",

  deliveryRemarks: "",
  deliveryDate: "",

  vehicleNo: "",
  driverName: "",

  paymentType: "Paid",
  yourName: "Suresh Kumar",
  profit: {
    totalCost: 0,
    expenses: 0,
    amount: 0,
  },
};

export default function Page() {
  const router = useRouter();
  const search = useSearchParams();
  const editId = search.get("editId");

  const isEdit = Boolean(editId);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingPrint, setLoadingPrint] = useState(false);
  const [onlySave, setOnlySave] = useState(false);

  /* ========= AUTO CALCULATE AMOUNT + PROFIT ========= */
  useEffect(() => {
    if (form.amountType === "not-fixed") {
      const weight = Number(form.weightCharged) || 0;
      const rate = Number(form.rateperkg) || 0;

      const extras =
        Number(form.freight) +
        Number(form.riskCharge) +
        Number(form.surcharge) +
        Number(form.hamali) +
        Number(form.serviceCharge);

      const total = weight * rate + extras;

      setForm((prev) => ({
        ...prev,
        amount: total > 0 ? total.toFixed(2) : "",
        profit: {
          ...prev.profit,
          totalCost: total,
          amount: total - (prev.profit?.expenses || 0),
        },
      }));
    }
  }, [
    form.weightCharged,
    form.rateperkg,
    form.freight,
    form.riskCharge,
    form.surcharge,
    form.hamali,
    form.serviceCharge,
  ]);

  /* ========= LOAD EDIT DATA ========= */
  const fetchConsignment = useCallback(async () => {
    if (!editId) return;

    try {
      const res = await fetch("/api/consignment", {
        method: "POST", // ⬅ IMPORTANT
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "GET_BY_ID",
          id: editId,
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setForm({
        ...INITIAL_FORM,
        ...data,
        profit: data.profit || INITIAL_FORM.profit,
      });
    } catch {
      toast.error("Failed to load consignment");
    }
  }, [editId]);

  useEffect(() => {
    fetchConsignment();
  }, [fetchConsignment]);

  /* ========= CHANGE ========= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "vehicleNo" ? value.toUpperCase() : value,
    }));
  };

  /* ========= SUBMIT ========= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingSave || loadingPrint) return;

    onlySave ? setLoadingSave(true) : setLoadingPrint(true);

    try {
      const res = await fetch(`/api/consignment`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);

      const cn = data?.data?.cn || form.cn;

      if (!onlySave) {
        await printPDF(cn, { ...form, cn });
        toast.success("Saved & PDF printed");
      } else {
        toast.success("Saved successfully");
      }

      router.push("/consignment/list");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setLoadingSave(false);
      setLoadingPrint(false);
    }
  };

  return (
    <>
      <Navbar />
      <Toaster />

      <div className="pt-20 pb-20 px-6 bg-white">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isEdit ? "Edit Consignment Note" : "Create Consignment Note"}
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
          <section>
            <h2 className="font-semibold text-lg mb-3">Charges</h2>

            {/* Select Amount Type */}
            <div className="mb-3">
              <label className="mr-3 font-medium">Amount Type:</label>
              <select
                name="amountType"
                value={form.amountType}
                onChange={handleChange}
                className="border rounded px-2 py-1"
              >
                <option value="not-fixed">Not Fixed</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>

            {form.amountType === "not-fixed" ? (
              <div className="grid sm:grid-cols-4 gap-4">
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
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Manual base amount */}
                <input
                  name="tempAmount"
                  type="number"
                  step="0.01"
                  {...numberOnlyProps}
                  value={form.tempAmount}
                  onChange={handleChange}
                  placeholder="Enter Base Amount"
                  className="input"
                />

                {/* Auto-calculated with extras */}
                <input
                  value={(() => {
                    const base = Number(form.tempAmount) || 0;
                    const extras =
                      (Number(form.hamali) || 0) +
                      (Number(form.surcharge) || 0) +
                      (Number(form.freight) || 0) +
                      (Number(form.riskCharge) || 0) +
                      (Number(form.serviceCharge) || 0);
                    const total = base + extras;

                    // Save into form.amount automatically
                    if (form.amount !== total.toFixed(2)) {
                      setForm((prev) => ({
                        ...prev,
                        amount: total.toFixed(2),
                      }));
                    }
                    return total.toFixed(2);
                  })()}
                  disabled
                  placeholder="Total with Extras"
                  className="input bg-gray-100"
                />
              </div>
            )}
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
                {...numberOnlyProps}
                value={form.freight}
                onChange={handleChange}
                className="input"
              />

              <input
                type="text"
                name="riskCharge"
                {...numberOnlyProps}
                placeholder="Enter Risk Charge"
                value={form.riskCharge}
                onChange={handleChange}
                className="input"
              />

              <input
                type="text"
                name="surcharge"
                {...numberOnlyProps}
                placeholder="Enter Surcharge"
                value={form.surcharge}
                onChange={handleChange}
                className="input"
              />

              <input
                type="text"
                name="hamali"
                {...numberOnlyProps}
                placeholder="Enter Hamali"
                value={form.hamali}
                onChange={handleChange}
                className="input"
              />

              <input
                type="text"
                name="serviceCharge"
                placeholder="Enter Service Charge"
                {...numberOnlyProps}
                value={form.serviceCharge}
                onChange={handleChange}
                className="input"
              />
              <input
                type="text"
                name="measurement"
                placeholder="Enter Measurement"
                {...numberOnlyProps}
                value={form.measurement}
                onChange={handleChange}
                className="input"
              />
              <div>
                <input
                  type="text"
                  name="paidAt"
                  placeholder="Paid At Location"
                  value={form.paidAt}
                  onChange={handleChange}
                  className="input"
                />
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
=                <input
                  type="number"
                  name="ebayBill"
                  placeholder="E-BayBill"
                  value={form.ebayBill}
                  onChange={handleChange}
                  className="input"
                  pattern="\d{12}"
                />
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

          {/* ===== ACTION BUTTONS ===== */}
          <div className="flex gap-5">
            <motion.button
              type="submit"
              disabled={loadingSave}
              onClick={() => setOnlySave(true)}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-bold"
            >
              {loadingSave ? "Saving..." : "Save"}
            </motion.button>

            <motion.button
              type="submit"
              disabled={loadingPrint}
              onClick={() => setOnlySave(false)}
              className="w-full py-3 bg-red-700 text-white rounded-lg font-bold"
            >
              {loadingPrint ? "Processing..." : "Save & Print PDF"}
            </motion.button>
          </div>
        </form>
      </div>
    </>
  );
}
