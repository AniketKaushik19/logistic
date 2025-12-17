import Link from 'next/link';

export default function VehicleCard({ id, name }) {
  return (
    <Link href={`/vehicle/${id}`}>
      <div className="bg-gradient-to-br from-white to-blue-50 shadow-xl rounded-xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-blue-200">
        <div className="text-5xl mb-4 text-center">🚛</div>
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{name}</h3>
        <p className="text-gray-600 text-center">ID: {id}</p>
        <div className="mt-4 flex justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
            Manage Vehicle
          </div>
        </div>
      </div>
    </Link>
  );
}