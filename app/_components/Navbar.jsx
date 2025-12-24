"use client";

import { motion } from "framer-motion";
import Link from "next/link"; // ✅ Import Link
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
// NAVBAR COMPONENT
function Navbar({admin}) {
    const [isOpen, setIsOpen] = useState(false);
   const { user, loading, refreshAuth } = useAuth();
   const router = useRouter();

  const logout = async () => {
    // ✅ Remove token from localStorage
    localStorage.removeItem("auth_token");

    // ✅ Refresh auth context
    await refreshAuth();

    // ✅ Redirect to login
    router.push("/login");
  };

  if (loading) return null;

   //Admin Navbar
  if(user ){
     return (
       <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur shadow"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-600">
          {/* <Link className="flex gap-2 cursor-pointer  hover:text-red-600 transition" href="/"> */}
           {/* <Image src={"/logo.png"}  width={43} height={43} alt="logo"/>
           </Link> */}
           <Link href="/" className="cursor-pointer  hover:text-red-600 transition">
              Aniket Logistic
            </Link>
          
         </h1>
          {/* Navbar links */}
        <ul className="flex gap-6 text-sm font-medium">
          <li>
            <Link href="/profit" className="cursor-pointer  hover:text-red-600 transition">
              Profit Add
            </Link>
          </li>
          <li>
            <Link href="/vehicleDashboard" className="cursor-pointer  hover:text-red-600 transition">
              Vehicle
            </Link>
          </li>
          <li>
            <Link href="/consignment/list" className="cursor-pointer hover:text-red-600 transition">
              Consignment
            </Link>
          </li>
           <button className="bg-white bg-opacity-20 px-3 py-1 text-center rounded-full text-sm text-red-400 font-bold hover:cursor-pointer" onClick={logout}>
                 <LogOut/>
            </button>
        </ul>
      </div>
    </motion.nav>
     )
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
            <Link href="/" className="cursor-pointer  hover:text-red-600 transition">
              Home
            </Link>
          </li>
          <li>
            <Link href="/login" className="cursor-pointer  hover:text-red-600 transition">
              login
            </Link>
          </li>
        </ul>
      </div>
    </motion.nav>
  );
}

export default Navbar;