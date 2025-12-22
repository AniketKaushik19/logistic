"use client"
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { EditVehicle } from "./EditVehicle";
import toast from "react-hot-toast";

export default function VehicleCard({
  id,
  name,
  capacity,
  registrationYear,
  driverName,
  onDelete,
}) {
  
  return (
    <div className="relative bg-linear-to-br from-white to-blue-50 shadow-xl rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-blue-200">

      {/* Top Right Action Buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        
        {/* Edit Button Wrapper */}
        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white border shadow hover:bg-blue-50 transition">
          <EditVehicle
            name={name}
            driverName={driverName}
            capacity={capacity}
          />
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(name)}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-white border shadow hover:bg-red-50 transition"
          title="Delete Vehicle"
        >
          <Trash2 size={18} className="text-red-600" />
        </button>
      </div>

      {/* Icon */}
      <div className="text-5xl mb-4 text-center">🚛</div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
        {name}
      </h3>

      {/* Details */}
      <div className="space-y-2 text-gray-700">
        <p><strong>Capacity:</strong> {capacity} tons</p>
        <p><strong>Registration Year:</strong> {registrationYear}</p>
        <p><strong>Driver:</strong> {driverName}</p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-center gap-4">
        <button className="bg-linear-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-green-600 hover:to-blue-600 transition-all">
          Track Vehicle
        </button>

        <Link href={`/vehicle/${name}`}>
          <button className="bg-linear-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
            Manage Vehicle
          </button>
        </Link>
      </div>
    </div>
  );
}
