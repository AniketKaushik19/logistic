"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/_components/Navbar";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { refreshAuth } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    // 🔥 Refresh auth immediately
    await refreshAuth();

    toast.success("Logged in");

    // 🚀 Instant redirect
    router.replace("/vehicleDashboard");
  } catch (err) {
    console.error(err);
    setError("Invalid Credentials.");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-linear-to-brrom-blue-50 via-slate-50 to-indigo-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="rounded-2xl shadow-2xl border border-slate-200 backdrop-blur">
            <CardContent className="p-8 space-y-6">
              {/* Header */}
              <motion.div
                className="text-center space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <ShieldCheck size={32} className="drop-shadow-lg" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-sm text-slate-600">Sign in to your logistic account</p>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-3 bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl"
                >
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail size={16} className="text-blue-600" /> Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                </motion.div>

                {/* Password */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Lock size={16} className="text-blue-600" /> Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                </motion.div>

                {/* Button */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Button
                    type="submit"
                    className="w-full rounded-lg text-base font-semibold bg-linear-to-br from-blue-600 to-indigo-600 hover:from-blue-700  hover:cursor-pointer hover:to-indigo-700 transition-all duration-200 shadow-lg text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing In...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Footer */}
              <motion.p className="text-center text-sm text-slate-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  Only Admin can Access
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}