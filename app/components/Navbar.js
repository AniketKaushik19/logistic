"use client"
import { LogOut, Menu, X } from 'lucide-react'
import React, { useState } from 'react'
// import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const Navbar = () => {
  // const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

<<<<<<< HEAD
  const handleLogout = () => {  
    // Clear user data from localStorage
    localStorage.removeItem('user');  
    // Redirect to login page
    // router.push('/login');
  }
=======
  const handleLogout = async() =>{
  await fetch("/api/auth/logout", { method: "POST" });
  router.replace("/login");
};

>>>>>>> 9c0a7788a7c9d26fcd1ff1eb34825bcfbdbe4f38

  return (
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-white text-2xl font-bold">🚛 Aniket Logistic</Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-white hover:text-gray-200">Dashboard</Link>
              <Link href="/AddVehicle" className="text-white hover:text-gray-200">Add Vehicle</Link>
              <Link href="/expense" className="text-white hover:text-gray-200">Expenses</Link>
              <button className="bg-white bg-opacity-20 px-3 py-1 text-center rounded-full text-sm text-green-400 font-bold hover:cursor-pointer" onClick={handleLogout}>
               <LogOut/>
              </button>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {isOpen && (
            <div className="md:hidden mt-4">
              <div className="flex flex-col space-y-2">
                <Link href="/" className="text-white hover:text-gray-200" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <Link href="/AddVehicle" className="text-white hover:text-gray-200" onClick={() => setIsOpen(false)}>Add Vehicle</Link>
                <Link href="/expense" className="text-white hover:text-gray-200" onClick={() => setIsOpen(false)}>Expenses</Link>
                <button className="bg-white bg-opacity-20 px-3 py-1 text-center rounded-full text-sm text-green-400 font-bold hover:cursor-pointer" onClick={handleLogout}>
                 <LogOut/>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
  )
}
