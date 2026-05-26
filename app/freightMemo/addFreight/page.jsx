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
  CreditCard,
  Printer,
  Save
} from "lucide-react";

import { useState, useEffect } from "react";
import Navbar from "@/app/_components/Navbar";
import { numberToWords } from "@/utils/numberToWord";
import toast from "react-hot-toast";
import FreightMemoPDF from "@/app/components/FreightMemo";
import { pdf } from "@react-pdf/renderer";
import incrementBillNo from "@/utils/incrementNumber";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function FreightMemo() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState([]);
  const [consignments, setConsignments] = useState([]);
  const [filteredConsignments, setFilteredConsignments] = useState([]);
  const [showConsignmentSuggestions, setShowConsignmentSuggestions] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

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
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    if (form.weight === "Fixed" || form.rate === "Fixed") {
      setIsFixed(true);
    } else {
      setIsFixed(false);
    }
  }, [form.weight, form.rate]);

  const handleRateTypeChange = (Fixed) => {
    if (Fixed) {
      setForm(prev => {
        const totalVal = parseFloat(prev.total) || 0;
        const advanceVal = parseFloat(prev.advance) || 0;
        const netBalanceVal = totalVal - advanceVal;
        return {
          ...prev,
          weight: "Fixed",
          rate: "Fixed",
          total: totalVal > 0 ? totalVal : "",
          netBalance: netBalanceVal,
          amountInWords: numberToWords(Math.floor(netBalanceVal)),
        };
      });
    } else {
      setForm(prev => ({
        ...prev,
        weight: "",
        rate: "",
        total: 0,
        netBalance: 0,
        amountInWords: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handlePrint = async (freight) => {
    saveFreight()
    router.push('/freightMemo')

    const blob = await pdf(<FreightMemoPDF data={freight} />).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (win) win.onload = () => win.print();
  }


  const saveFreight = async () => {
    try {
      const res = await fetch("/api/freight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Save successfully")
        setForm(initialFormState)
        router.push('/freightMemo')
      }

    } catch (error) {
      toast.error("Error saving freight");
    }
  };

  const addGrNo = () => {
    setForm({ ...form, grNos: [...form.grNos, ""] });
  };

  const removeGrNo = (index) => {
    const updated = form.grNos.filter((_, i) => i !== index);
    setForm({ ...form, grNos: updated });
  };

  useEffect(() => {
    const advance = parseFloat(form.advance) || 0;

    if (form.weight === "Fixed" || form.rate === "Fixed") {
      const total = parseFloat(form.total) || 0;
      const netBalance = total - advance;
      setForm(prev => ({
        ...prev,
        netBalance,
        amountInWords: numberToWords(Math.floor(netBalance)),
      }));
      return;
    }

    const rate = parseFloat(form.rate);
    const weight = parseFloat(form.weight);

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
  }, [form.rate, form.weight, form.advance, form.total]);

  const lastFreight = async () => {
    try {
      const last = await fetch('/api/freight/lastFreight', {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const res = await last.json()
      setForm((prev) => ({
        ...prev,
        challanNo: res.data.challanNo
      }))
      handleNextBill()
    } catch (error) {
      console.log("Error in Last Freight")
      toast.error("Error in Fetching Serial number")
    }
  }

  const handleNextBill = () => {
    console.log("calling handlenext freight")
    setForm((prev) => ({
      ...prev,
      challanNo: incrementBillNo(prev.challanNo)
    }));
  };

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
    lastFreight();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const res = await fetch("/api/vehicle", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data || []);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Fetch consignments when lorryNo changes
  useEffect(() => {
    if (form.lorryNo) {
      fetchConsignmentsForVehicle(form.lorryNo);
    } else {
      setConsignments([]);
      setFilteredConsignments([]);
    }
  }, [form.lorryNo]);

  const fetchConsignmentsForVehicle = async (lorryNo) => {
    try {
      const res = await fetch("/api/consignment", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        // Filter consignments for the selected vehicle using the correct field name
        const filtered = data.filter(
          (c) => c.vehicleNo === lorryNo
        );
        setConsignments(filtered || []);
        setFilteredConsignments([]);
      }
    } catch (error) {
      console.error("Error fetching consignments:", error);
    }
  };

  // Filter consignments as user types GR number
  const handleGrChange = (index, value) => {
    const updated = [...form.grNos];
    updated[index] = value;
    setForm({ ...form, grNos: updated });

    if (value.length > 0) {
      const filtered = consignments.filter((c) =>
        (c.cn || "").toLowerCase().includes(value.toLowerCase()) ||
        (c.grNo || "").toLowerCase().includes(value.toLowerCase())
      );
      setFilteredConsignments(filtered);
      setShowConsignmentSuggestions(true);
    } else {
      setFilteredConsignments([]);
      setShowConsignmentSuggestions(false);
    }
  };

  // Select consignment and auto-populate cost
  const selectConsignment = (index, consignment) => {
    const updated = [...form.grNos];
    updated[index] = consignment.cn;
    setForm((prev) => ({
      ...prev,
      grNos: updated,
      total: consignment.amount || 0,
      weight: consignment.weight || prev.weight,
      rate: consignment.amount && consignment.weight ? consignment.amount / consignment.weight : prev.rate,
    }));
    setFilteredConsignments([]);
    setShowConsignmentSuggestions(false);
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8 space-y-8 mt-12">

        {/* HEADER */}
        <div className="text-center border-b pb-4">
          <h2 className="text-sm tracking-widest text-gray-500">FREIGHT MEMO</h2>
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
            label="Challan No"
            name="challanNo"
            disabled
            value={form.challanNo}
            onChange={handleChange}
          />

          <Input
            icon={<Calendar size={16} />}
            label="Date"
            type="date"
            name="date"
            placeholder="Select date"
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

          {/* Lorry No Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Lorry No</label>
            <div className="relative">
              <select
                name="lorryNo"
                value={form.lorryNo}
                onChange={handleChange}
                disabled={loadingVehicles}
                className="w-full border-b border-dashed border-gray-400 focus:outline-none focus:border-indigo-600 py-2 pl-10 pr-8 bg-transparent appearance-none cursor-pointer"
              >
                <option value="">Select a vehicle...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle.truckNumber}>
                    {vehicle.truckNumber} - {vehicle.driverName} (Capacity: {vehicle.capacity} kg)
                  </option>
                ))}
              </select>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Truck size={16} />
              </span>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* //mutiple GR /Consignment no. with suggestions */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-600">
            G.R. No / Consignment No
          </label>

          {form.grNos.map((gr, index) => (
            <div key={index} className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={gr}
                    onChange={(e) => {
                      const selected = consignments.find(
                        (c) => c.cn === e.target.value
                      );
                      if (selected) {
                        selectConsignment(index, selected);
                      } else {
                        const updated = [...form.grNos];
                        updated[index] = e.target.value;
                        setForm({ ...form, grNos: updated });
                      }
                    }}
                    disabled={!form.lorryNo}
                    className="w-full border-b border-dashed border-gray-400 
              focus:outline-none focus:border-indigo-600 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!form.lorryNo
                        ? "Select a vehicle first..."
                        : consignments.length === 0
                          ? "No GR Nos found for this vehicle"
                          : `Select Consignment No / GR No ${index + 1}`}
                    </option>

                    {consignments.map((consignment, idx) => (
                      <option
                        key={idx}
                        value={consignment.cn}
                      >
                        {consignment.cn} — {consignment.origin} → {consignment.destination} | ₹{consignment.amount || 0}
                      </option>
                    ))}
                  </select>
                </div>

                {form.grNos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGrNo(index)}
                    className="hover:cursor-pointer text-red-500 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addGrNo}
            className="hover:cursor-pointer text-indigo-600 text-xs font-medium"
          >
            + Add GR No
          </button>
        </div>


        {/* RATE TYPE TOGGLE */}
        <div className="flex flex-col gap-2 border-t pt-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Rate / Freight Type</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleRateTypeChange(false)}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:cursor-pointer ${!isFixed
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
            >
              Non-Fixed (Calculated by Weight & Rate)
            </button>
            <button
              type="button"
              onClick={() => handleRateTypeChange(true)}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:cursor-pointer ${isFixed
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
            >
              Fixed (Flat Total Rate)
            </button>
          </div>
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
            readOnly={isFixed}
          />

          <Input
            icon={<IndianRupee size={16} />}
            label="Rate"
            name="rate"
            value={form.rate}
            onChange={handleChange}
            readOnly={isFixed}
          />
        </div>


        {/* PAYMENT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            icon={<IndianRupee size={16} />}
            label="Total Lorry Hire"
            name="total"
            type="number"
            value={form.total}
            readOnly={!isFixed}
            onChange={handleChange}
          />

          <Input
            icon={<CreditCard size={16} />}
            label="Advance"
            name="advance"
            type="number"
            value={form.advance}
            onChange={handleChange}
          />

          <Input
            icon={<IndianRupee size={16} />}
            label="Net Balance"
            name="netBalance"
            value={form.netBalance}
            readOnly
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
            onClick={() => handlePrint(form)}
            className="rounded-xl bg-blue-100 text-blue-700 px-3 py-2 hover:bg-blue-200 transition flex items-center gap-1 hover:cursor-pointer"
            title="Print"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={() => saveFreight()}
            className="rounded-xl bg-blue-100 text-blue-700 px-3 py-2 hover:bg-blue-200 transition flex items-center gap-1 hover:cursor-pointer"
            title="Save"
          >
            <Save size={16} />
            Save
          </button>

        </div>

      </div>
    </div>
  );
}

/* ---------- INPUT COMPONENT ---------- */

const Input = ({ label, icon, className = "", ...props }) => (
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
          py-2 ${icon ? "pl-10" : "pl-2"} bg-transparent ${props.readOnly ? "text-gray-500 cursor-not-allowed bg-gray-50" : ""} ${className}`}
      />
    </div>
  </div>
);
