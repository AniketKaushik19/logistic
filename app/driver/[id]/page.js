"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DriverForm from "@/components/DriverForm";
import { Loader } from "lucide-react";

export default function DriverDetailPage() {
  const params = useParams();
  const { id } = params || {};
  const router = useRouter();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
console.log(id)
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/driver", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const found = (data || []).find(
            (d) => d._id === id || d._id === id?.toString()
          );
          setDriver(found || null);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  const handleSuccess = () => {
    router.push("/driver/list");
  };
        console.log(driver)

  if (loading) return <div className="p-4"><Loader className="transition-all animate-spin"/> Loading...</div>;
  if (!driver) return <div className="p-4">Driver not found</div>;

  return (
    <>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-3">
          Edit Driver: {driver.name}
        </h2>
        <DriverForm
          initialData={driver}
          onSuccess={handleSuccess}
          onCancel={() => router.push("/driver/list")}
        />
      </div>
    </>
  );
}
