'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, PlusCircle, Hash, Weight, Calendar, User, Car } from "lucide-react";
import toast from 'react-hot-toast';
import Router from 'next/router';
import Navbar from '../_components/Navbar';

export default function AddTruckVehicle() {
  const [formData, setFormData] = useState({
    truckNumber: '',
    model: '',
    capacity: '',
    registrationYear: '',
    driverName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Truck added successfully!")
        setFormData({
          truckNumber: '',
          model: '',
          capacity: '',
          registrationYear: '',
          driverName: '',
        });
        setTimeout(() => {
          Router.push('/Dashboard')
        }, 3000)
      } else {
        toast.error(data.message || "Failed to add truck")
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center px-4 py-24">
      <Navbar />

      <Card className="w-full max-w-xl rounded-3xl shadow-2xl border border-white/30 bg-white/70 backdrop-blur-xl">

        {/* Header */}
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg w-fit">
            <Truck size={34} />
          </div>

          <CardTitle className="text-3xl font-extrabold text-gray-800">
            Add New Truck
          </CardTitle>

          <p className="text-sm text-gray-600">
            Register a new vehicle to your logistics fleet
          </p>
        </CardHeader>

        {/* Content */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Truck Number */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                <Hash size={16} className="text-indigo-500" />
                Truck Number
              </label>
              <Input
                name="truckNumber"
                value={formData.truckNumber}
                onChange={handleChange}
                placeholder="UP32 AB 1234"
                required
                className="h-11 rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Model */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                <Car size={16} className="text-indigo-500" />
                Model
              </label>
              <Input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Tata Ace"
                required
                className="h-11 rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                <Weight size={16} className="text-indigo-500" />
                Load Capacity (tons)
              </label>
              <Input
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                type="number"
                placeholder="10"
                required
                className="h-11 rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Registration Year */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                <Calendar size={16} className="text-indigo-500" />
                Registration Year
              </label>
              <Input
                name="registrationYear"
                value={formData.registrationYear}
                onChange={handleChange}
                type="number"
                placeholder="2020"
                required
                className="h-11 rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Driver Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                <User size={16} className="text-indigo-500" />
                Driver Name
              </label>
              <Input
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="h-11 rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl text-lg font-bold flex items-center justify-center gap-2
                     bg-gradient-to-r from-indigo-500 to-purple-600
                     hover:from-indigo-600 hover:to-purple-700
                     shadow-lg transition-all"
            >
              {loading ? "Adding..." : (
                <>
                  <PlusCircle size={20} />
                  Add Truck
                </>
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>

  );
}
