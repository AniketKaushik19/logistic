"use client";

import { motion } from "framer-motion";
import Link from "next/link"; // ✅ Import Link
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
// NAVBAR COMPONENT
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();
   const logout = async () => {
    try {

      // ✅ CALL LOGOUT API (IMPORTANT)
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // ✅ Refresh auth (now /me returns 401)
      await refreshAuth();

      // ✅ Redirect
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) return null;

  //Admin Navbar
  if (user) {
    return (
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur shadow"
      >
        <div className="max-w-[100vw] mx-auto px-6 py-4 flex justify-between items-center">  
             
           <div className=" md:hidden">        
            <Link className="flex gap-2 lg:gap-0 cursor-pointer  hover:text-red-600 transition"  href={user? "/dashboard" : "/"}> 
             <Image src={"/logo.png"}  width={45} height={40} alt="logo"/>
           </Link> 
           </div>
            <h2 className="font-bold text-red-500 hidden md:flex">
            <Link
              href={user? "/dashboard" : "/"}
              className="cursor-pointer  hover:text-red-600 transition"
              >
              Aniket Logistic
              </Link>
              </h2>
          
          {/* Navbar links */}
          <ul className="flex gap-6 text-sm font-medium  ">
            <li className="mt-2 ">
              <Link
                href="/vehicleDashboard"
                className="cursor-pointer hover:text-red-600 transition"
              >
                Vehicle
              </Link>
            </li>
            <li className="mt-2 ">
              <Link
                href="/consignment/list"
                className="cursor-pointer hover:text-red-600 transition"
              >
                Consignment
              </Link>
            </li>
            <li className="mt-2 ">
              <Link
                href="/e-bill"
                className="cursor-pointer hover:text-red-600 transition"
              >
                E-bill
              </Link>
            </li>
            <li className="mt-2 ">
              <Link
                href="/profit"
                className="cursor-pointer  hover:text-red-600 transition"
              >
                Profit Add
              </Link>
            </li>
            <button
              className="bg-white bg-opacity-20 px-3 py-1 text-center rounded-full text-sm text-red-400 font-bold hover:cursor-pointer"
              onClick={logout}
            >
              <LogOut />
            </button>
          </ul>
        </div>
      </motion.nav>
    );
  }

  // Regular Navabar
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur shadow"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-600">Aniket Logistic</h1>
        <ul className="flex gap-6 text-sm font-medium">
          {/* Apply links */}
          <li>
            <Link
              href="/"
              className="cursor-pointer  hover:text-red-600 transition"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="cursor-pointer  hover:text-red-600 transition"
            >
              Login
            </Link>
          </li>
        </ul>
      </div>
    </motion.nav>
  );
}

export default Navbar;
