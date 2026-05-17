"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  HeartPulse,
  Wallet,
} from "lucide-react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

export default function DriverForm({
  initialData = null,
  onSuccess = () => {},
  onCancel = () => {},
}) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    bloodGroup: "",
    contactNumber: "",
    emailAddress: "",
    permanentLocal: "",
    vehicleNumber: "",
    salary: "",
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =====================================================
     PREFILL
  ===================================================== */
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        address: initialData.address || "",
        bloodGroup: initialData.bloodGroup || "",
        contactNumber:
          initialData.contactNumber || "",
        emailAddress:
          initialData.emailAddress || "",
        permanentLocal:
          initialData.permanentLocal || "",
        vehicleNumber:
          initialData.vehicleNumber || "",
        salary: initialData.salary ?? "",
      });
    }
  }, [initialData]);

  /* =====================================================
     LOAD VEHICLES
  ===================================================== */
  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await fetch("/api/vehicle");

        if (res.ok) {
          const data = await res.json();
          setVehicles(data || []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadVehicles();
  }, []);

  /* =====================================================
     HANDLE CHANGE
  ===================================================== */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =====================================================
     SUBMIT
  ===================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const payload = { ...form };

      const url = "/api/driver";

      let res;

      if (initialData && initialData._id) {
        res = await fetch(url, {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            id: initialData._id,
            ...payload,
          }),
        });
      } else {
        res = await fetch(url, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.error || "Request failed"
        );
      }

      toast.success(
        initialData
          ? "Driver updated"
          : "Driver added"
      );

      onSuccess(json);
    } catch (err) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {initialData
            ? "Update Driver"
            : "Add New Driver"}
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Manage driver profile and vehicle
          assignment.
        </p>
      </div>

      {/* =====================================================
          FORM GRID
      ===================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[50vh] overflow-scroll">

        {/* NAME */}
        <FieldWrapper
          icon={<User className="size-4" />}
          label="Driver Name"
        >
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter driver name"
            required
            className="h-11"
          />
        </FieldWrapper>

        {/* CONTACT */}
        <FieldWrapper
          icon={<Phone className="size-4" />}
          label="Contact Number"
        >
          <Input
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="Enter contact number"
            required
            className="h-11"
          />
        </FieldWrapper>

        {/* EMAIL */}
        <FieldWrapper
          icon={<Mail className="size-4" />}
          label="Email Address"
        >
          <Input
            name="emailAddress"
            value={form.emailAddress}
            onChange={handleChange}
            placeholder="Enter email address"
            className="h-11"
          />
        </FieldWrapper>

        {/* BLOOD GROUP */}
        <FieldWrapper
          icon={<HeartPulse className="size-4" />}
          label="Blood Group"
        >
          <Input
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            placeholder="Ex: O+"
            className="h-11"
          />
        </FieldWrapper>

        {/* LOCAL */}
        <FieldWrapper
          icon={<MapPin className="size-4" />}
          label="Permanent / Local"
        >
          <Input
            name="permanentLocal"
            value={form.permanentLocal}
            onChange={handleChange}
            placeholder="Permanent / Local"
            className="h-11"
          />
        </FieldWrapper>

        {/* VEHICLE */}
        <FieldWrapper
          icon={<Truck className="size-4" />}
          label="Assign Vehicle"
        >
          <select
            name="vehicleNumber"
            value={form.vehicleNumber}
            onChange={handleChange}
            className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">
              -- Select Vehicle --
            </option>

            {vehicles.map((v) => (
              <option
                key={v._id}
                value={
                  v.truckNumber ||
                  v.vehicleNumber ||
                  ""
                }
              >
                {v.truckNumber ||
                  v.vehicleNumber}
              </option>
            ))}
          </select>
        </FieldWrapper>

        {/* SALARY */}
        <FieldWrapper
          icon={<Wallet className="size-4" />}
          label="Default Salary"
        >
          <Input
            name="salary"
            type="number"
            value={form.salary}
            onChange={handleChange}
            placeholder="Enter salary"
            required
            className="h-11"
          />
        </FieldWrapper>

        {/* ADDRESS */}
        <div className="md:col-span-2">
          <FieldWrapper
            icon={<MapPin className="size-4" />}
            label="Address"
          >
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows={4}
              className="w-full rounded-md border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </FieldWrapper>
        </div>
      </div>

      {/* =====================================================
          ACTIONS
      ===================================================== */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
          className="hover:cursor-pointer"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-emerald-500 text-white hover:opacity-90 hover:cursor-pointer min-w-[120px]"
        >
          {loading
            ? "Saving..."
            : initialData
            ? "Update Driver"
            : "Save Driver"}
        </Button>
      </div>
    </form>
  );
}

/* =====================================================
   REUSABLE FIELD WRAPPER
===================================================== */
function FieldWrapper({
  icon,
  label,
  children,
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <span className="text-indigo-600">
          {icon}
        </span>

        {label}
      </label>

      {children}
    </div>
  );
}