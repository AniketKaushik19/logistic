'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/app/_components/Navbar';
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
  File,
  Save
} from "lucide-react";
import { numberToWords } from '@/utils/numberToWord';
import { pdf } from '@react-pdf/renderer';
import { BillPDF } from '@/app/components/BillPDF';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function EditInvoice({params}) {

   const [_id, setId] = useState(null);

   useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);
  const router =useRouter()

  const [form, setForm] = useState({
    customer: '',
    customerAddress: '',
    customerGstin: '',
    billNo: 'BL-',
    billDate: '',
    partyCode: '',
    vendorCode: '',
    consignments: [
      {
        cnNo: '',
        cnDate: '',
        from: '',
        to: '',
        freight: '',
        labour: '',
        detention: '',
        bonus: '',
        total: 0,
      },
    ],
    grandTotal: 0,
    amountInWord: '',
  });
  
  
  const handleConsignmentChange = (index, field, value) => {
    const updated = [...form.consignments];
    updated[index][field] = value;

    // Auto total per consignment
    const c = updated[index];
    updated[index].total =
      Number(c.freight) +
      Number(c.labour) +
      Number(c.detention) +
      Number(c.bonus);

    setForm({ ...form, consignments: updated });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const grandTotal = form.consignments.reduce(
      (sum, c) => sum + Number(c.total || 0),
      0
    );

    setForm((prev) => ({
      ...prev,
      grandTotal,
      amountInWord: grandTotal > 0 ? numberToWords(grandTotal) : '',
    }));
  }, [form.consignments]);

  const addConsignment = () => {
    setForm({
      ...form,
      consignments: [
        ...form.consignments,
        {
          cnNo: '',
          cnDate: '',
          from: '',
          to: '',
          freight: '',
          labour: '',
          detention: '',
          bonus: '',
          total: 0,
        },
      ],
    });
  };

  /* AUTO TOTAL → STORE IN FORM */
  useEffect(() => {
    const total =
      Number(form.freight) +
      Number(form.labour) +
      Number(form.detention) +
      Number(form.bonus);

    setForm((prev) => ({
      ...prev, total,
      amountInWord: total > 0 ? numberToWords(total) : "",
    }));
  }, [form.freight, form.labour, form.detention, form.bonus]);


    const handlePrint = async (bill) => {
      const blob = await pdf(<BillPDF bill={bill} />).toBlob();
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url);
      if (newWindow) {
        newWindow.onload = () => {
        newWindow.print(); // trigger browser print dialog
        };
      }
   };

   const clearForm=()=>{
      setForm(
          {
            customer: '',
            customerAddress: '',
            customerGstin: '',
            billNo: '',
            billDate: '',
            partyCode: '',
            vendorCode: '',
            consignments: [
              {
                cnNo: '',
                cnDate: '',
                from: '',
                to: '',
                freight: '',
                labour: '',
                detention: '',
                bonus: '',
                total: 0,
              },
            ],
            grandTotal: 0,
            amountInWord: '',
          }
        )
   }
  const saveEbill = async () => {
    try {
      const res = await fetch("/api/e-bill", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data) {
        toast.success("Save  successfully!!!")
        router.push('/e-bill')
        clearForm();
      }

    } catch (error) {
      toast.error("Error saving E-bill");
    }
  };

  const getEbill=async(id)=>{
    try {
      const res = await fetch(`/api/e-bill/editE-bill/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id),
      });

      const data = await res.json();

      if (data) {
        setForm(prev=>({
          ...prev,
          ...data.data
        }))
      }

    } catch (error) {
      toast.error("Error saving E-bill");
      console.log(error)
    }
  }
  useEffect(()=>{
   if(_id){
     getEbill(_id)
   }
  },[_id])
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 mt-12">
          Edit Transport Invoice
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
              disabled
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

          {form.length>0 && form.consignments.map((c, index) => (
            <div
              key={index}
              className="border rounded-xl p-5 space-y-4 bg-gray-50"
            >
              <h3 className="font-semibold text-indigo-700">
                Consignment #{index + 1}
              </h3>

              {/* CN NO */}
              <Input
                icon={<File size={18} />}
                placeholder="Consignment Number"
                value={c.cnNo}
                onChange={(e) =>
                  handleConsignmentChange(index, "cnNo", e.target.value)
                }
              />

              {/* SHOW BELOW ONLY IF CN NO EXISTS */}
              {c.cnNo && (
                <>
                  {/* DATE */}
                  <Input
                    icon={<Calendar size={18} />}
                    type="date"
                    value={c.cnDate}
                    onChange={(e) =>
                      handleConsignmentChange(index, "cnDate", e.target.value)
                    }
                  />

                  {/* ROUTE */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      icon={<MapPin size={18} />}
                      placeholder="From"
                      value={c.from}
                      onChange={(e) =>
                        handleConsignmentChange(index, "from", e.target.value)
                      }
                    />
                    <Input
                      icon={<Truck size={18} />}
                      placeholder="To"
                      value={c.to}
                      onChange={(e) =>
                        handleConsignmentChange(index, "to", e.target.value)
                      }
                    />
                  </div>

                  {/* CHARGES */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      icon={<IndianRupee size={18} />}
                      placeholder="Freight"
                      type="number"
                      value={c.freight}
                      onChange={(e) =>
                        handleConsignmentChange(index, "freight", e.target.value)
                      }
                    />
                    <Input
                      icon={<IndianRupee size={18} />}
                      placeholder="Labour"
                      type="number"
                      value={c.labour}
                      onChange={(e) =>
                        handleConsignmentChange(index, "labour", e.target.value)
                      }
                    />
                    <Input
                      icon={<Clock size={18} />}
                      placeholder="Detention"
                      type="number"
                      value={c.detention}
                      onChange={(e) =>
                        handleConsignmentChange(index, "detention", e.target.value)
                      }
                    />
                    <Input
                      icon={<Gift size={18} />}
                      placeholder="Bonus"
                      type="number"
                      value={c.bonus}
                      onChange={(e) =>
                        handleConsignmentChange(index, "bonus", e.target.value)
                      }
                    />
                  </div>

                  {/* TOTAL */}
                  <Input
                    icon={<IndianRupee size={18} />}
                    value={c.total}
                    readOnly
                  />
                </>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addConsignment}
            className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50"
          >
            + Add Consignment
          </button>

          {/* //Grand total */}
          <Section title="Grand Total">
            <Input
              icon={<IndianRupee size={18} />}
              value={form.grandTotal}
              readOnly
            />
            <p className="text-sm text-gray-600 italic">
              Amount in Words: {form.amountInWord}
            </p>
          </Section>


          {/* ACTION */}
          <div className="flex justify-end pt-6">
            <Button
                  size="icon"
                    className="bg-blue-500 text-white h-9 w-9 rounded-full shadow hover:scale-105 transition"
                    variant="outline"
                    onClick={() => saveEbill()}
                  >
                    <Save size={18} />
                  </Button>
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