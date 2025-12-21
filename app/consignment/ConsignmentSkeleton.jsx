export default function ConsignmentSkeleton() {
  return (
    <div className="pt-20 pb-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto animate-pulse space-y-8">
        
        {/* Title */}
        <div className="h-8 w-64 bg-gray-200 rounded mx-auto" />
        <div className="h-4 w-40 bg-gray-200 rounded mx-auto" />

        {/* Card */}
        <div className="bg-white p-8 rounded-xl shadow-lg space-y-8 border">
          
          {/* Section */}
          <SectionSkeleton titleWidth="w-32">
            <InputSkeleton />
            <InputSkeleton />
            <TextareaSkeleton />
          </SectionSkeleton>

          <SectionSkeleton titleWidth="w-32">
            <InputSkeleton />
            <InputSkeleton />
            <TextareaSkeleton />
            <TextareaSkeleton />
          </SectionSkeleton>

          {/* Route */}
          <div className="grid sm:grid-cols-3 gap-4">
            <InputSkeleton />
            <InputSkeleton />
            <InputSkeleton />
          </div>

          {/* Goods */}
          <SectionSkeleton titleWidth="w-24">
            <InputSkeleton />
            <div className="grid sm:grid-cols-4 gap-4">
              <InputSkeleton />
              <InputSkeleton />
              <InputSkeleton />
              <InputSkeleton />
            </div>
          </SectionSkeleton>

          {/* Charges */}
          <div className="grid sm:grid-cols-3 gap-4">
            <InputSkeleton />
            <InputSkeleton />
            <InputSkeleton />
          </div>

          {/* Vehicle */}
          <div className="grid sm:grid-cols-3 gap-4">
            <InputSkeleton />
            <InputSkeleton />
            <InputSkeleton />
          </div>

          {/* Button */}
          <div className="h-12 w-full bg-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function SectionSkeleton({ children, titleWidth = "w-24" }) {
  return (
    <div className="space-y-4">
      <div className={`h-5 ${titleWidth} bg-gray-300 rounded`} />
      {children}
    </div>
  );
}

function InputSkeleton() {
  return <div className="h-11 w-full bg-gray-200 rounded-lg" />;
}

function TextareaSkeleton() {
  return <div className="h-20 w-full bg-gray-200 rounded-lg" />;
}
