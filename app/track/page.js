import { Suspense } from "react";
import Navbar from "../_components/Navbar";
import TrackClient from "./TrackClient";

export default function TrackPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="pt-32 text-center">Loading...</div>}>
        <TrackClient />
      </Suspense>
    </>
  );
}
