'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, PlusCircle, Hash, Weight, Calendar, User, Car } from "lucide-react";
import toast from 'react-hot-toast';
import Router from 'next/router';

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
        setTimeout(()=>{
            Router.push('/Dashboard')
        },3000)
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg rounded-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 text-primary w-fit">
            <Truck size={32} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Add New Truck</CardTitle>
          <p className="text-sm text-gray-600">Fill in the details to register a new vehicle</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Truck Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Hash size={16} /> Truck Number
              </label>
              <Input
                name="truckNumber"
                value={formData.truckNumber}
                onChange={handleChange}
                placeholder="e.g., UP32 AB 1234"
                required
                className="rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Car size={16} /> Model
              </label>
              <Input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., Tata Ace"
                required
                className="rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Weight size={16} /> Load Capacity (tons)
              </label>
              <Input
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                type="number"
                placeholder="e.g., 10"
                required
                className="rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Registration Year */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <Calendar size={16} /> Registration Year
              </label>
              <Input
                name="registrationYear"
                value={formData.registrationYear}
                onChange={handleChange}
                type="number"
                placeholder="e.g., 2020"
                required
                className="rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Driver Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <User size={16} /> Driver Name
              </label>
              <Input
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                required
                className="rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-lg font-semibold flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 transition-colors"
            >
              {loading ? 'Adding...' : <><PlusCircle size={20} /> Add Truck</>}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}
