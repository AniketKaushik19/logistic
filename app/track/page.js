"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ConsignmentTable from "../_components/ConsignmentTable";
import { generatePDF } from "@/utils/generatePDF";
import Navbar from "../_components/Navbar";
export default function TrackConsignment() {
  const [cn, setCn] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔍 Fetch consignment
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
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Auto-track when URL param changes
  useEffect(() => {
    const q = searchParams.get("cn");
    if (q) {
      setCn(q);
      track(q);
    }
  }, [searchParams]);


  return (<>
    <Navbar/>
    <div className="pt-20 mx-auto px-4 bg-white">
      <h1 className="text-2xl font-bold mb-4 text-black text-center">Track Consignment</h1>

      <div className="flex gap-2 text-center max-w-[50vw] mx-auto">
        <input
          className="input flex-1"
          placeholder="Enter consignment number"
          value={cn}
          onChange={(e) => setCn(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              router.push(`/track?cn=${encodeURIComponent(cn.trim())}`);
            }
          }}
        />

        <button
          onClick={() => {
            if (!cn.trim()) {
              setError("Please enter a consignment number");
              return;
            }
            router.push(`/track?cn=${encodeURIComponent(cn.trim())}`);
          }}
          className="bg-red-600 text-black px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Searching..." : "Track"}
        </button>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

     <ConsignmentTable data={data}/>
{data?.consignment && (
  <button
    onClick={()=>generatePDF(cn,data?.consignment)}
    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
               text-white font-semibold px-4 py-2 rounded-lg shadow-md 
               hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg 
               transition duration-200 ease-in-out my-3"
  >
    {/* Optional icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
    Download PDF
  </button>
)}    </div>
  </>

  );
}
