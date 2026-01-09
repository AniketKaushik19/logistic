"use client";
import React, { useEffect, useState } from "react";
import DriverForm from "@/components/DriverForm";
import DriverCard from "@/components/DriverCard";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmToast from "@/app/components/ConfirmToast";
import Navbar from "@/app/_components/Navbar";
import SalaryActions from "@/app/_components/SalaryActions";
import SalaryHistoryModal from "@/app/_components/SalaryHistoryModal";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function DriverListPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [salaryDriver, setSalaryDriver] = useState(null);
  const [historyDriver, setHistoryDriver] = useState(null); // 🔥

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/driver", { credentials: "include" });
      if (!res.ok) return;

      const driversData = await res.json();
      const month = getCurrentMonth();

      const enriched = await Promise.all(
        driversData.map(async (driver) => {
          try {
            const salaryRes = await fetch(
              `/api/driver/salary?driverId=${driver._id}&month=${month}`,
              { credentials: "include" }
            );
            const salaryDetails = salaryRes.ok ? await salaryRes.json() : {};
            return { ...driver, salaryDetails };
          } catch {
            return { ...driver, salaryDetails: {} };
          }
        })
      );

      setDrivers(enriched);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSalaryUpdated = async () => {
    setSalaryDriver(null);
    await load(); // 🔥 refresh cards
  };

  const handleEdit = (driver) => {
    setEditing(driver);
    setShowForm(true);
  };

  const handleDelete = async (driver) => {
    const confirmed = await ConfirmToast({ msg: `Delete driver ${driver.name}?` });
    if (!confirmed) return;

    try {
      const res = await fetch("/api/driver", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: driver._id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Driver deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Navbar />

      {/* ===== Salary Modal ===== */}
      <Dialog open={!!salaryDriver} onOpenChange={() => setSalaryDriver(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white">
             <DialogHeader>
            <DialogTitle>
              Salary – {salaryDriver?.name}
            </DialogTitle>
          </DialogHeader>
          <h3 className="text-lg font-semibold">
            Salary – {salaryDriver?.name}
          </h3>

          <SalaryActions
            driver={salaryDriver}
            onClose={() => setSalaryDriver(null)}
            onUpdated={handleSalaryUpdated}
          />
        </DialogContent>
      </Dialog>

      {/* ===== History Modal ===== */}
      <Dialog open={!!historyDriver} onOpenChange={() => setHistoryDriver(null)}>
         <DialogContent className="sm:max-w-[700px] bg-white">
          <DialogHeader>
            <DialogTitle>
              Salary History – {historyDriver?.name}
            </DialogTitle>
          </DialogHeader>
        {historyDriver && (
          <SalaryHistoryModal
            driver={historyDriver}
            onClose={() => setHistoryDriver(null)}
          />
        )}
        </DialogContent>
      </Dialog>

      {/* ===== Page Content ===== */}
      <div className="p-4 mt-20">
        <div className="flex justify-between mb-4">
          <h1 className="md:text-2xl font-semibold">
            Driver Salary Dashboard
          </h1>

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-emerald-400 text-white">
                <Plus className="size-4" /> Add Driver
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[720px] bg-white">
            <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Driver" : "Add Driver"}
                </DialogTitle>
              </DialogHeader>
              <DriverForm
                initialData={editing}
                onSuccess={() => {
                  setShowForm(false);
                  setEditing(null);
                  load();
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((d) => (
              <DriverCard
                key={d._id}
                driver={d}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSalary={setSalaryDriver}
                onHistory={setHistoryDriver} // 🔥 open history modal
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
