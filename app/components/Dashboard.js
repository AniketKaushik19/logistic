import { Navbar } from "./Navbar";
import VehicleCard from "./VehicleCard";

const vehicles = [
  { id: "UP32AB4040", name: 'Truck 1' },
  { id: "UP32AB4020", name: 'Truck 2' },
  { id: "UP32AB4030", name: 'Van 1' },
  { id: "UP32AB4050", name: 'Van 2' },
  { id: "UP32AB4060", name: 'Pickup 1' },
  { id: "UP32AB4070", name: 'Pickup 2' },
];  
    
export default function Dashboard() {
    return(
        <>
        <Navbar/>
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