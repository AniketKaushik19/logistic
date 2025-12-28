"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { generatePDF } from "@/utils/generatePDF";
import Navbar from "@/app/_components/Navbar";

const numberOnlyProps = {
  min: 0,
  onKeyDown: (e) => {
    if (["e", "E", "-", "+"].includes(e.key)) {
      e.preventDefault();
    }
  },
};

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return new Error("Failed");
    (async () => {
      const token = localStorage.getItem("auth_token");

      try {
        const res = await fetch(`/api/consignment/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed");
        }
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load consignment");
      }
    })();
  }, [id]);

  if (!form)
    return (
      <>
        <Navbar />
        <div className="pt-20 px-6">Loading...</div>
      </>
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/consignment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Updated");
      router.push("/consignment/list");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await generatePDF(form.cn || form.consignmentNo || "CN", form);
      toast.success("PDF generated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 pb-20 px-6">
        <Toaster />
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">
            Edit Consignment {form.cn || ""}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Consignor Name
              </label>
              <input
                name="consignorName"
                value={form.consignorName || ""}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Consignee Name
              </label>
              <input
                name="consigneeName"
                value={form.consigneeName || ""}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Consignment Date
              </label>
              <input
                name="consignmentDate"
                type="date"
                value={
                  form.consignmentDate ? form.consignmentDate.split("T")[0] : ""
                }
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-2">
              <input
                name="weightCharged"
                type="number"
                step="0.01"
                {...numberOnlyProps}
                value={form.weightCharged || ""}
                onChange={handleChange}
                className="input"
                placeholder="Weight Charged"
              />
              <input
                name="rateperkg"
                type="number"
                step="0.01"
                {...numberOnlyProps}
                value={form.rateperkg || ""}
                onChange={handleChange}
                className="input"
                placeholder="Rate / Kg"
              />
              <input
                name="amount"
                value={form.amount || ""}
                onChange={handleChange}
                className="input"
                placeholder="Amount"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Download
              </button>
              <button
                type="button"
                onClick={() => router.push("/consignment/list")}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
