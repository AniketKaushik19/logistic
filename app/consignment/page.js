import { Suspense } from "react";
import ConsignmentClient from "./ConsignmentClient";
import ConsignmentSkeleton from "./ConsignmentSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<ConsignmentSkeleton />}>
      <ConsignmentClient />
    </Suspense>
  );
}
