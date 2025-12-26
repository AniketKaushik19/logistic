"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      await refreshAuth();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) return null;

  // ================= ADMIN NAVBAR =================
  if (user) {
    return (
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur shadow bg-white"
      >
        <div className="max-w-[100vw] mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <Image
              src="/logo.png"
              width={42}
              height={42}
              alt="Aniket Logistic Logo"
            />
            <span className="hidden md:block font-bold text-lg text-red-500">
              Aniket Logistic
            </span>
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-6 text-sm font-medium items-center">
            <li>
              <Link href="/vehicleDashboard" className="hover:text-red-600">
                Vehicle
              </Link>
            </li>
            <li>
              <Link href="/consignment/list" className="hover:text-red-600">
                Consignment
              </Link>
            </li>
            <li>
              <Link href="/e-bill" className="hover:text-red-600">
                E-bill
              </Link>
            </li>
            <li>
              <Link href="/profit" className="hover:text-red-600">
                Profit Add
              </Link>
            </li>
                <li>
              <Link
                href="/access-dashboard"
                className="cursor-pointer hover:text-red-600 transition"
              >
                Security
              </Link>
            </li>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-red-100 text-red-500"
            >
              <LogOut size={18} />
            </button>
          </ul>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <ul className="flex flex-col gap-4 px-6 py-4 text-sm font-medium">
              <Link onClick={() => setOpen(false)} href="/vehicleDashboard">
                Vehicle
              </Link>
              <Link onClick={() => setOpen(false)} href="/consignment/list">
                Consignment
              </Link>
              <Link onClick={() => setOpen(false)} href="/e-bill">
                E-bill
              </Link>
              <Link onClick={() => setOpen(false)} href="/profit">
                Profit Add
              </Link>
              <Link onClick={() => setOpen(false)} href="/access-dashboard">
Security              </Link>

              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 text-red-500"
              >
                <LogOut size={18} /> Logout
              </button>
            </ul>
          </motion.div>
        )}
      </motion.nav>
    );
  }

  // ================= PUBLIC NAVBAR =================
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur shadow bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-600">Aniket Logistic</h1>

        <ul className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
        </ul>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t">
          <ul className="flex flex-col gap-4 px-6 py-4 text-sm font-medium">
            <Link onClick={() => setOpen(false)} href="/">Home</Link>
            <Link onClick={() => setOpen(false)} href="/login">Login</Link>
          </ul>
        </div>
      )}
    </motion.nav>
  );
}

export default Navbar;
