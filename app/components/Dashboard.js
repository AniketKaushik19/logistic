"use client"
import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import VehicleCard from "./VehicleCard";
import Link from "next/link";

 
export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  useEffect(() => {
    // Fetch vehicle data from API if needed
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicle');
        const data = await response.json();
        console.log(data);
       setVehicles(data)
        // Update state with fetched vehicles if implementing dynamic data
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };
    fetchVehicles()
  }, []);
  console.log(vehicles);
    return(
        <>
        <Navbar/>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Fleet Overview</h1>
          <p className="text-gray-600">Monitor and manage your logistic vehicles</p>
        </div>
        <button className="bg-purple-500 rounded-2xl p-3 mb-5 font-semibold hover:bg-purple-600 hover:cursor-pointer text-white font-semibold">
          <Link href={`/AddVehicle`}>
             Add vehichle
          </Link>
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.truckNumber}  name={vehicle.truckNumber}  capacity={vehicle.capacity} registrationYear={vehicle.registrationYear} driverName={vehicle.driverName}/>
          ))}
        </div>
      </main>
    </>
    )
}   