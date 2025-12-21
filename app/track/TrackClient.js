"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ConsignmentTable from "../_components/ConsignmentTable";
import { generatePDF } from "@/utils/generatePDF";

export default function TrackClient() {
  const [cn, setCn] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch consignment
  const track = async (value) => {
    const query = String(value ?? "").trim();
    if (!query) {
      setError("Please enter a consignment number");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(query)}`);
      const json = await res.json();

      if (!res.ok || json?.success === false) {
        setError(json?.message || "Consignment not found");
      } else {
        setData(json);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Auto-track from URL
  useEffect(() => {
    const q = searchParams.get("cn");
    if (q) {
      setCn(q);
      track(q);
    }
  }, [searchParams]);

  return (
    <div className="pt-20 mx-auto px-4 bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Track Consignment
      </h1>

      <div className="flex gap-2  mx-auto">
        <input
          className="input flex-1"
          placeholder="Enter consignment number"
          value={cn}
          onChange={(e) => setCn(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              router.push(`/track?cn=${encodeURIComponent(cn.trim())}`);
            }
          }}
        />

        <button
          onClick={() =>
            router.push(`/track?cn=${encodeURIComponent(cn.trim())}`)
          }
          className="bg-red-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Searching..." : "Track"}
        </button>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      <ConsignmentTable data={data} />

      {data?.consignment && (
        <button
          onClick={() => generatePDF(cn, data.consignment)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600
                     text-white font-semibold px-4 py-2 rounded-lg shadow-md
                     hover:from-blue-700 hover:to-indigo-700 transition my-3"
        >
          Download PDF
        </button>
      )}
    </div>
  );
}
