"use client";
import React, { useEffect, useState } from "react";
import DriverForm from "@/components/DriverForm";
import DriverCard from "@/components/DriverCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmToast from "@/app/components/ConfirmToast";
import Navbar from "@/app/_components/Navbar";
import SalaryActions from "@/app/_components/SalaryActions";

export default function DriverListPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [salaryDriver, setSalaryDriver] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/driver", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDrivers(data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleSuccess = async () => {
    setShowForm(false);
    setEditing(null);
    await load();
  };

  const handleEdit = (driver) => {
    setEditing(driver);
    setShowForm(true);
  };
  const openSalary = (driver) => {
    setSalaryDriver(driver);
  };

  const handleDelete = async (driver) => {
    const confirmed = await ConfirmToast({
      msg: `Delete driver ${driver.name}?`,
    });
    if (!confirmed) return;
    try {
      const res = await fetch("/api/driver", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: driver._id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      toast.success("Driver deleted");
      await load();
    } catch (err) {
      toast.error(err.message || "Error deleting");
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <Dialog open={!!salaryDriver} onOpenChange={() => setSalaryDriver(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <h3 className="text-lg font-semibold">
            Salary – {salaryDriver?.name}
          </h3>

          <SalaryActions
            driver={salaryDriver}
            onClose={() => setSalaryDriver(null)}
          />
        </DialogContent>
      </Dialog>

      <div className="p-4 mt-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className=" md:text-2xl font-semibold">
            Driver Salary Dashboard
          </h1>
          <div>
            <Dialog
              open={showForm}
              onOpenChange={(open) => {
                if (!open) {
                  setEditing(null);
                }
                setShowForm(open);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditing(null);
                    setShowForm(true);
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 text-white"
                >
                  <Plus className="size-4" /> Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[720px] bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">
                    {editing ? "Edit Driver" : "Add Driver"}
                  </h3>
                </div>
                <DriverForm
                  initialData={editing}
                  onSuccess={handleSuccess}
                  onCancel={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.length === 0 && <div>No drivers found</div>}
            {drivers.map((d) => (
              <DriverCard
                key={d._id}
                driver={d}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSalary={openSalary}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
