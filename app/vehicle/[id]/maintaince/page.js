"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";


export default function Maintaince() {
  const { id } = useParams();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [records, setRecords] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRecords = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/maintaince?vehicleId=${id}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "200") {
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error("Error fetching maintenance records:", err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    if (!description || !amount || !date) {
      setError("Please fill in description, amount, and date.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/maintaince", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vehicleId: id,
          description,
          amount,
          date,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to save record.");
        return;
      }

      setMessage(data.message || "Maintenance record saved.");
      setDescription("");
      setAmount("");
      setDate("");
      fetchRecords();
    } catch (err) {
      console.error("Error saving maintenance record:", err);
      setError("Failed to save record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 ">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card className="bg-white shadow-lg border border-slate-200">
              <CardHeader>
                <span className="text-2xl font-bold">{id}</span>
                <CardTitle>New Maintenance Record</CardTitle>
                <CardDescription>
                  Enter the description, amount, and date of work performed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Enter maintenance description"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                    <div className="relative">
                  <input
                    name="consignmentDate"
                    type="date"
                    placeholder="Select maintenance date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="input"
                  />
                  {!date && (
                    <span className="md:hidden pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      Maintaince date
                    </span>
                  )}
                </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Saving..." : "Save Record"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
      
      </div>
    </>
  );
}
