"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { generatePDF } from "@/utils/generatePDF";

/* ================= UTILS ================= */

const numberOnlyProps = {
  min: 0,
  onKeyDown: (e) => {
    if (["e", "E", "-", "+"].includes(e.key)) e.preventDefault();
  },
};

/* ================= MODAL ================= */

export default function EditConsignmentModal({ id, onClose, onSuccess }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ===== FETCH ===== */
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/consignment/${id}`, {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) throw new Error();
        const data = await res.json();
        setForm(data);
      } catch {
        toast.error("Failed to load consignment");
        onClose();
      }
    })();
  }, [id, onClose]);

  /* ===== HANDLERS ===== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/consignment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Update failed");
        return;
      }

      toast.success("Consignment updated successfully");
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await generatePDF(form.cn || "CN", form);
      toast.success("PDF generated");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  if (!form) return null;

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[70vw] max-w-[1200px] h-[70vh] rounded-lg shadow-lg flex flex-col">

        {/* ===== HEADER ===== */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold">
            Edit Consignment {form.cn || ""}
          </h2>
        </div>

        {/* ===== BODY (SCROLLABLE) ===== */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-6"
        >

          {/* BASIC */}
          <Section title="Auto Calculated Rate">
            <Input value={form.cn || ""} disabled />
            <input
              type="date"
              name="consignmentDate"
              value={form.consignmentDate?.split("T")[0] || ""}
              onChange={handleChange}
              className="input"
            />
          </Section>

          {/* CONSIGNOR */}
          <Section title="Consignor">
            <Input name="consignorName" form={form} onChange={handleChange} />
            <Input name="consignorPhone" form={form} onChange={handleChange} />
            <Input name="consignorAddress" form={form} onChange={handleChange} span />
            <Input name="consignorCSTNo" form={form} onChange={handleChange} />
          </Section>

          {/* CONSIGNEE */}
          <Section title="Consignee">
            <Input name="consigneeName" form={form} onChange={handleChange} />
            <Input name="consigneePhone" form={form} onChange={handleChange} />
            <Input name="consigneeAddress" form={form} onChange={handleChange} span />
            <Input name="consigneeCSTNo" form={form} onChange={handleChange} />
            <Input name="deliveryAddress" form={form} onChange={handleChange} span />
          </Section>

          {/* ROUTE */}
          <Section title="Route">
            <Input name="fromLocation" form={form} onChange={handleChange} />
            <Input name="toLocation" form={form} onChange={handleChange} />
          </Section>

          {/* GOODS */}
          <Section title="Goods">
            <Input name="goodsDescription" form={form} onChange={handleChange} span />
            <NumInput name="packageCount" form={form} onChange={handleChange} />
            <Input name="packageMethod" form={form} onChange={handleChange} />
            <Input name="fax" form={form} onChange={handleChange} />
          </Section>

          {/* WEIGHT & CHARGES */}
          <Section title="Weight & Charges">
            <NumInput name="weightActual" form={form} onChange={handleChange} />
            <NumInput name="weightCharged" form={form} onChange={handleChange} />
            <NumInput name="rateperkg" form={form} onChange={handleChange} />
            <NumInput name="amount" form={form} onChange={handleChange} />
          </Section>

          {/* INVOICE */}
          <Section title="Invoice">
            <Input name="invoiceNo" form={form} onChange={handleChange} />
            <NumInput name="invoiceValue" form={form} onChange={handleChange} />
            <NumInput name="freight" form={form} onChange={handleChange} />
            <NumInput name="riskCharge" form={form} onChange={handleChange} />
            <NumInput name="surcharge" form={form} onChange={handleChange} />
            <NumInput name="hamali" form={form} onChange={handleChange} />
            <NumInput name="serviceCharge" form={form} onChange={handleChange} />
            <Input name="measurement" form={form} onChange={handleChange} />
          </Section>

          {/* DELIVERY */}
          <Section title="Delivery">
            <input
              type="date"
              name="deliveryDate"
              value={form.deliveryDate?.split("T")[0] || ""}
              onChange={handleChange}
              className="input"
            />
            <Input name="deliveryRemarks" form={form} onChange={handleChange} span />
          </Section>

          {/* VEHICLE */}
          <Section title="Vehicle">
            <input
              name="vehicleNo"
              value={form.vehicleNo || ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  vehicleNo: e.target.value.toUpperCase(),
                }))
              }
              className="input"
            />
            <Input name="driverName" form={form} onChange={handleChange} />
            <select
              name="paymentType"
              value={form.paymentType || "Paid"}
              onChange={handleChange}
              className="input"
            >
              <option value="Paid">Paid</option>
              <option value="To Pay">To Pay</option>
              <option value="Billing">Billing</option>
            </select>
          </Section>
        </form>

        {/* ===== FOOTER (FIXED) ===== */}
        <div className="border-t p-4 flex justify-end gap-2 bg-white">
          <button type="button" onClick={handleDownload} className="btn-blue">
            Download
          </button>
          <button type="submit" onClick={handleSubmit} disabled={loading} className="btn-yellow">
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={onClose} className="btn-gray">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

const Section = ({ title, children }) => (
  <div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <div className="grid md:grid-cols-3 gap-3">{children}</div>
  </div>
);

const Input = ({ name, form, onChange, span, ...props }) => (
  <input
    {...props}
    name={name}
    value={form?.[name] || ""}
    onChange={onChange}
    className={`input ${span ? "md:col-span-3" : ""}`}
    placeholder={name?.replace(/([A-Z])/g, " $1")}
  />
);

const NumInput = ({ name, form, onChange }) => (
  <input
    type="number"
    {...numberOnlyProps}
    name={name}
    value={form?.[name] || ""}
    onChange={onChange}
    className="input"
    placeholder={name.replace(/([A-Z])/g, " $1")}
  />
);
