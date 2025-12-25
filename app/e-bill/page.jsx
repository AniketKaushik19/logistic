'use client';
import { useState } from 'react';
import DownloadBill from "../components/DownoladBill";
export default function InvoiceForm() {
  const [form, setForm] = useState({
    customer: 'M/s. MOTORFAB SALES PVT LTD, LUCKNOW-19',
    billDate: '2025-08-18',
    cnDate: '2025-08-14',
    from: 'LKO',
    to: 'TML LKO',
    freight: 700,
    labour: 0,
    detention: 0,
    bonus: 0,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Transport Invoice Form</h1>

      {/* Text Inputs */}
      <input
        name="customer"
        value={form.customer}
        onChange={handleChange}
        placeholder="Customer"
        className="border p-2 w-full"
      />
      <input
        name="billDate"
        type="date"
        value={form.billDate}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        name="cnDate"
        type="date"
        value={form.cnDate}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <input
        name="from"
        value={form.from}
        onChange={handleChange}
        placeholder="From"
        className="border p-2 w-full"
      />
      <input
        name="to"
        value={form.to}
        onChange={handleChange}
        placeholder="To"
        className="border p-2 w-full"
      />

      {/* Numeric Inputs */}
      {['freight', 'labour', 'detention', 'bonus'].map((field) => (
        <input
          key={field}
          name={field}
          type="number"
          value={form[field]}
          onChange={handleChange}
          placeholder={field}
          className="border p-2 w-full"
        />
      ))}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        <DownloadBill/>
      </button>
      
    </main>
  );
}