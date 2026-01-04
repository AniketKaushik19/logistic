"use client";
import React, { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

export default function DriverForm({ initialData = null, onSuccess = () => {}, onCancel = () => {} }) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    bloodGroup: '',
    contactNumber: '',
    emailAddress: '',
    permanentLocal: '',
    vehicleNumber: '',
    salary: '',
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        address: initialData.address || '',
        bloodGroup: initialData.bloodGroup || '',
        contactNumber: initialData.contactNumber || '',
        emailAddress: initialData.emailAddress || '',
        permanentLocal: initialData.permanentLocal || '',
        vehicleNumber: initialData.vehicleNumber || '',
        salary: initialData.salary ?? '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    async function loadVehicles(){
      try{
        const res = await fetch('/api/vehicle');
        if (res.ok){
          const data = await res.json();
          setVehicles(data || []);
        }
      }catch(err){ console.error(err) }
    }
    loadVehicles();
  },[])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      const url = '/api/driver';
      let res;
      if (initialData && initialData._id) {
        res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: initialData._id, ...payload }),
        });
      } else {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      toast.success(initialData ? 'Driver updated' : 'Driver added');
      onSuccess(json);
    } catch (err) {
      toast.error(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <Input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact number" required />
        <Input name="emailAddress" value={form.emailAddress} onChange={handleChange} placeholder="Email" />
        <Input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="Blood group" />
        <Input name="permanentLocal" value={form.permanentLocal} onChange={handleChange} placeholder="Permanent / Local" />
        <select name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} className="rounded-md border px-3 py-2">
          <option value="">-- Select Vehicle --</option>
          {vehicles.map(v => (
            <option key={v._id} value={v.truckNumber || v.vehicleNumber || ''}>{v.truckNumber || v.vehicleNumber}</option>
          ))}
        </select>
        <Input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary" required />
        <Input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="md:col-span-2" />
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
}
