'use client';

import {
  FileText,
  Calendar,
  MapPin,
  Truck,
  Weight,
  IndianRupee,
  User,
  Hash,
  CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/app/_components/Navbar";
import { numberToWords } from "@/utils/numberToWord";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function EditFreight({params}) {
  const [_id, setId] = useState(null);
   useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);
  const router=useRouter()
  const initialFormState = {
    challanNo: "CH-",
    date: "",
    grNos: [""],     // multiple GR numbers
    to: "",
    from: "",
    lorryNo: "",

    packages: "",
    weight: "",
    rate: "",

    total: 0,
    advance: "",
    netBalance: 0,

    amountInWords: "",
    payableAt: "",

    driverName: "",
    ownerName: "",

    engineNo: "",
    chassisNo: "",
    licenceNo: "",

    through: "",
  };
  const [form, setForm] = useState(initialFormState);

  const getFreight = async (_id) => {
    try {
      console.log(_id)
      const res = await fetch(`/api/freight/editFreight?id=${_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify(_id),
      });

      const data = await res.json();

      if (data) {
        setForm(prev => ({
          ...prev,
          ...data.data
        }))
      }

    } catch (error) {
      toast.error("Error saving Freight");
      console.log(error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveFreight = async () => {
    try {
      const res = await fetch("/api/freight", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Save  successfully")
        setForm(initialFormState)
        router.push('/freightMemo')
      }

    } catch (error) {
      toast.error("Error saving freight");
    }
  };

  const handleGrChange = (index, value) => {
    const updated = [...form.grNos];
    updated[index] = value;
    setForm({ ...form, grNos: updated });
  };

  const addGrNo = () => {
    setForm({ ...form, grNos: [...form.grNos, ""] });
  };

  const removeGrNo = (index) => {
    const updated = form.grNos.filter((_, i) => i !== index);
    setForm({ ...form, grNos: updated });
  };

  useEffect(() => {
    const rate = parseFloat(form.rate);
    const weight = parseFloat(form.weight);
    const advance = parseFloat(form.advance) || 0;

    // If inputs are empty or invalid → reset safely
    if (isNaN(rate) || isNaN(weight) || rate <= 0 || weight <= 0) {
      setForm(prev => ({
        ...prev,
        total: 0,
        netBalance: 0,
        amountInWords: "",
      }));
      return;
    }

    const total = rate * weight;

    const netBalance = total - advance;
    setForm(prev => ({
      ...prev,
      total,
      netBalance,
      amountInWords: numberToWords(Math.floor(netBalance)),
    }));
  }, [form.rate, form.weight, form.advance]);

 useEffect(()=>{
   if(_id){
     getFreight(_id)
   }
  },[_id])
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8 space-y-8 mt-12">

        {/* HEADER */}
        <div className="text-center border-b pb-4">
          <h2 className="text-sm tracking-widest text-gray-500"><span className="font-bold text-green-500">Edit </span>FREIGHT MEMO</h2>
          <h1 className="text-2xl font-bold tracking-wide">
            ANIKET LOGISTIC
          </h1>
          <p className="text-sm text-gray-600">
            7/A Buddh Vihar Colony, Phase-2 Kotwali Road, Chinhat, Lucknow – 226028
          </p>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            icon={<FileText size={16} />}
            disabled
            label="Challan No"
            name="challanNo"
            value={form.challanNo}
            onChange={handleChange}
          />

          <Input
            icon={<Calendar size={16} />}
            label="Date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />

          <Input
            icon={<MapPin size={16} />}
            label="To"
            name="to"
            value={form.to}
            onChange={handleChange}
          />

          <Input
            icon={<MapPin size={16} />}
            label="From"
            name="from"
            value={form.from}
            onChange={handleChange}
          />

          <Input
            icon={<Truck size={16} />}
            label="Lorry No"
            name="lorryNo"
            value={form.lorryNo}
            onChange={handleChange}
          />
        </div>

        {/* //mutiple GR /Consignment no.  */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-600">G.R. No</label>

          {form.grNos.map((gr, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={gr}
                onChange={(e) => handleGrChange(index, e.target.value)}
                className="w-full border-b border-dashed border-gray-400 
                   focus:outline-none focus:border-indigo-600 py-2"
                placeholder={`GR No ${index + 1}`}
              />

              {form.grNos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGrNo(index)}
                  className="text-red-500 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addGrNo}
            className="text-indigo-600 text-xs font-medium"
          >
            + Add GR No
          </button>
        </div>


        {/* GOODS INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            icon={<Hash size={16} />}
            label="No. of Packages"
            name="packages"
            value={form.packages}
            onChange={handleChange}
          />

          <Input
            icon={<Weight size={16} />}
            label="Weight"
            name="weight"
            value={form.weight}
            onChange={handleChange}
          />

          <Input
            icon={<IndianRupee size={16} />}
            label="Rate"
            name="rate"
            value={form.rate}
            onChange={handleChange}
          />
        </div>


        {/* PAYMENT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input
            value={form.total}
            readOnly
            className="border p-2 bg-gray-100 w-full"
          />

          <Input
            icon={<CreditCard size={16} />}
            label="Advance"
            name="advance"
            value={form.advance}
            onChange={handleChange}
          />

          <input
            value={form.netBalance}
            readOnly
            className="border p-2 bg-gray-100 w-full"
          />
        </div>


        {/* WORDS */}
        <Input
          label="Rupee in Words"
          name="amountInWords"
          value={form.amountInWords}
          onChange={handleChange}
        />

        <Input
          label="Payable At"
          name="payableAt"
          value={form.payableAt}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            icon={<User size={16} />}
            label="Driver's Name & Address"
            name="driverName"
            value={form.driverName}
            onChange={handleChange}
          />

          <Input
            icon={<User size={16} />}
            label="Owner's Name & Address"
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Engine No"
            name="engineNo"
            value={form.engineNo}
            onChange={handleChange}
          />

          <Input
            label="Chassis No"
            name="chassisNo"
            value={form.chassisNo}
            onChange={handleChange}
          />

          <Input
            label="Driver Licence No"
            name="licenceNo"
            value={form.licenceNo}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Through"
          name="through"
          value={form.through}
          onChange={handleChange}
        />


        {/* FOOTER NOTES */}
        <div className="text-xs text-gray-600 space-y-1 leading-relaxed border-t pt-4">
          <p>1. Goods loaded at owner's risk.</p>
          <p>2. If vehicle does not go direct, balance freight not payable.</p>
          <p>3. Goods will be unloaded at destination office.</p>
          <p>4. No unloading on Sunday or holidays.</p>
          <p>5. Freight payable as per destination office rates.</p>
        </div>

        {/* SIGNATURE */}
        <div className="flex justify-between pt-6 text-sm">
          <p>Signature of Driver / Owner / Agent</p>
          <p>Signature of Challan</p>
        </div>
        <div className="flex justify-end gap-4 pt-2">
          <button
            disabled={form.total <= 0}
            onClick={() => {saveFreight()
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}

/* ---------- INPUT COMPONENT ---------- */

const Input = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`w-full border-b border-dashed border-gray-400 
          focus:outline-none focus:border-indigo-600
          py-2 ${icon ? "pl-10" : "pl-2"} bg-transparent`}
      />
    </div>
  </div>
);
