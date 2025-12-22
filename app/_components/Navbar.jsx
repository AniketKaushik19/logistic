"use client";

import { motion } from "framer-motion";
import Link from "next/link"; // ✅ Import Link

// NAVBAR COMPONENT
function Navbar() {
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
            <Link href="/consignment" className="cursor-pointer  hover:text-red-600 transition">
              Consignment
            </Link>
          </li>
          <li>
            <Link href="/track" className="cursor-pointer  hover:text-red-600 transition">
              Track
            </Link>
          </li>
          <li>
            <Link href="/login" className="cursor-pointer  hover:text-red-600 transition">
              login
            </Link>
          </li>
          <li>
            <Link href="/signup" className="cursor-pointer  hover:text-red-600 transition">
              signup
            </Link>
          </li>
        </ul>
      </div>
    </motion.nav>
  );
}

export default Navbar;