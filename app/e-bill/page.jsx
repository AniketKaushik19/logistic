'use client';

import { useState, useEffect } from 'react';
import DownloadBill from "../components/DownoladBill";
import Navbar from '../_components/Navbar';
import toast from 'react-hot-toast';
import {
  User,
  Calendar,
  MapPin,
  Truck,
  IndianRupee,
  Gift,
  Clock,
  ReceiptText,
  Home,
  File
} from "lucide-react";


export default function InvoiceForm() {
  const [form, setForm] = useState({
    customer: '',
    customerAddress: '',
    customerGstin: '',
    billNo:"",
    billDate: '',
    cnDate: '',
    from: '',
    to: '',
    freight: '',
    labour: '',
    detention: '',
    bonus: '',
    total: '',
    partyCode:'',
    vendorCode:'',
    amountInWord:"",
    pan: "CPTPK5713K",
  });


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* AUTO TOTAL → STORE IN FORM */
  useEffect(() => {
    const total =
      Number(form.freight) +
      Number(form.labour) +
      Number(form.detention) +
      Number(form.bonus);

    setForm((prev) => ({ ...prev, total }));
  }, [form.freight, form.labour, form.detention, form.bonus]);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 mt-12">
          Transport Invoice
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">

          {/* Bill no */}
          <Section title="Bill No">
            <Input
              icon={<File size={18} />}
              name="billNo"
              value={form.billNo}
              onChange={handleChange}
              placeholder="BillNo"
            />
          </Section>
          {/* CUSTOMER */}
          <Section title="Customer Details">
            <Input
              icon={<User size={18} />}
              name="customer"
              value={form.customer}
              onChange={handleChange}
              placeholder="Customer Name"
            />

            <Textarea
              icon={<Home size={18} />}
              name="customerAddress"
              value={form.customerAddress}
              onChange={handleChange}
              placeholder="Customer Address"
            />
          </Section>

          {/* GSTIN */}
          <Section title="GSTIN Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                icon={<ReceiptText size={18} />}
                name="customerGstin"
                value={form.customerGstin}
                onChange={handleChange}
                placeholder="Customer GSTIN"
              />
            </div>
          </Section>

          {/* DATES */}

          <div>
            <h2 className='font-bold p-1 text-gray-600 text-xl'>
              Invoice Dates
            </h2>
            <label htmlFor="billDate" className="block text-sm font-medium text-gray-700">
              Bill Date
            </label>
            <Input
              icon={<Calendar size={18} />}
              name="billDate"
              type="date"
              value={form.billDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="cnDate" className="block text-sm font-medium text-gray-700">
              Consignment Date
            </label>
            <Input
              icon={<Calendar size={18} />}
              name="cnDate"
              type="date"
              value={form.cnDate}
              onChange={handleChange}
            />
          </div>

           {/* Codes */}
          <Section title="Code information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                icon={""}
                name="vendorCode"
                value={form.vendorCode}
                onChange={handleChange}
                placeholder="Vendor Code"
              />
              <Input
                icon={""}
                name="partyCode"
                value={form.partyCode}
                onChange={handleChange}
                placeholder="Party Code"
              />
            </div>
          </Section>

          {/* ROUTE */}
          <Section title="Route Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                icon={<MapPin size={18} />}
                name="from"
                value={form.from}
                onChange={handleChange}
                placeholder="From Location"
              />
              <Input
                icon={<Truck size={18} />}
                name="to"
                value={form.to}
                onChange={handleChange}
                placeholder="To Location"
              />
            </div>
          </Section>

          {/* CHARGES */}
          <Section title="Charges Breakdown">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                icon={<IndianRupee size={18} />}
                name="freight"
                type="number"
                value={form.freight}
                onChange={handleChange}
                placeholder="Freight Charges"
              />
              <Input
                icon={<IndianRupee size={18} />}
                name="labour"
                type="number"
                value={form.labour}
                onChange={handleChange}
                placeholder="Labour Charges"
              />
              <Input
                icon={<Clock size={18} />}
                name="detention"
                type="number"
                value={form.detention}
                onChange={handleChange}
                placeholder="Detention Charges"
              />
              <Input
                icon={<Gift size={18} />}
                name="bonus"
                type="number"
                value={form.bonus}
                onChange={handleChange}
                placeholder="Bonus / Overtime"
              />
            </div>
          </Section>

          {/* TOTAL */}
          <Section title="Total Amount">
            <Input
              icon={<IndianRupee size={18} />}
              name="total"
              value={form.total}
              readOnly
            />
          </Section>

          {/* ACTION */}
          <div className="flex justify-end pt-6">
             <button
              onClick={() => toast.success("Invoice Downloaded Successfully")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg transition"
            >
              <DownloadBill form={form} />
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

/* ---------------- UI HELPERS ---------------- */

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-lg font-semibold text-gray-700 mb-4">
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ icon, ...props }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      {icon}
    </span>
    <input
      {...props}
      className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3
                 focus:outline-none focus:ring-2 focus:ring-indigo-500
                 bg-gray-50 read-only:bg-gray-100"
    />
  </div>
);

const Textarea = ({ icon, ...props }) => (
  <div className="relative">
    <span className="absolute left-3 top-3 text-gray-400">
      {icon}
    </span>
    <textarea
      {...props}
      rows={3}
      className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3
                 focus:outline-none focus:ring-2 focus:ring-indigo-500
                 bg-gray-50 resize-none"
    />
  </div>
);
