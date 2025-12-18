import Link from 'next/link';

export default function VehicleCard({ id, name, capacity, registrationYear, driverName }) {
  return (
    <div className="bg-linear-to-br from-white to-blue-50 shadow-xl rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-blue-200">
      <div className="text-5xl mb-4 text-center">🚛</div>
      <h3 className="text-xl font-bold text-gray-800 text-center mb-4">{name}</h3>
      <div className="space-y-2 text-gray-700">
        <p><strong>Capacity:</strong> {capacity} tons</p>
        <p><strong>Registration Year:</strong> {registrationYear}</p>
        <p><strong>Driver:</strong> {driverName}</p>
      </div>
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