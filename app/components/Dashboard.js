import VehicleCard from './components/VehicleCard';

const vehicles = [
  { id: 1, name: 'Truck 1' },
  { id: 2, name: 'Truck 2' },
  { id: 3, name: 'Van 1' },
  { id: 4, name: 'Van 2' },
  { id: 5, name: 'Pickup 1' },
  { id: 6, name: 'Pickup 2' },
];

export default function Dashboard() {
    return(
        <>
         <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-white text-2xl font-bold">🚛 Aniket Logistic</div>
              <span className="text-blue-200">Dashboard</span>
            </div>
            <div className="text-white">
              <div className="text-sm">Fleet Management System</div>
              <div className="text-xs opacity-75">Real-time monitoring</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 px-3 py-1 text-center rounded-full text-sm text-green-400 font-bold">
                6 Vehicles Active
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Fleet Overview</h1>
          <p className="text-gray-600">Monitor and manage your logistic vehicles</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} id={vehicle.id} name={vehicle.name} />
          ))}
        </div>
      </main>
    </>
    )
}   