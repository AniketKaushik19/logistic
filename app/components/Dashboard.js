"use client"
import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import VehicleCard from "./VehicleCard";
import Link from "next/link";
import toast from "react-hot-toast"
import ConfirmToast from "./ConfirmToast";
import { Loader } from "lucide-react";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);  
  // Fetch vehicle data from API if needed
    const fetchVehicles = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/vehicle');
        const data = await response.json();
        console.log(data);
       setVehicles(data)
        // Update state with fetched vehicles if implementing dynamic data
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
      finally{
        setLoading(false)
      }
    };
 const onDelete=async(truckNumber)=>{   
    const confirmed = await ConfirmToast({msg:"Delete this Vehicle?"});
    if (!confirmed) return;
     try{
       const response=await fetch('/api/vehicle',{
         method:'DELETE',
         headers:{
           'Content-Type':'application/json',
         },
         body:JSON.stringify({truckNumber}),
       });
       const data=await response.json();
       if(data.message){
         console.log("Vehicle deleted successfully");
         toast.success("Vehicle deleted successfully");
       }
       fetchVehicles();
     }
     catch(error){
        console.error("Error deleting vehicle:",error)
     }
   }
  useEffect(() => {
   
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

        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
         <Loader className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-lg font-semibold text-gray-700">
            Loading Vehicles...
          </p>
        </div>
)}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.truckNumber}  name={vehicle.truckNumber}  capacity={vehicle.capacity} registrationYear={vehicle.registrationYear} driverName={vehicle.driverName} onDelete={onDelete}/>
          ))}
        </div>
      </main>
    </>
    )
}   