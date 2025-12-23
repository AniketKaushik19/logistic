"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();
console.log(user)
  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    await refreshAuth();
    router.push("/login");
  };

  if (loading) return null; // ⛔ prevent flicker

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full bg-white shadow z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
        <h1 className="font-bold text-red-600">Aniket Logistic</h1>

        <ul className="flex gap-6 text-sm font-medium">
          <li><Link href="/">Home</Link></li>

          {user ? (
            <><li><Link href="/track">Track</Link></li>

              <li><Link href="/consignment/list">Consignment</Link></li>
              <li
                onClick={logout}
                className="cursor-pointer text-red-600"
              >
                Logout
              </li>
            </>
          ) : (
            <li><Link href="/login">Login</Link></li>
          )}
        </ul>
      </div>
    </motion.nav>
  );
}
