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
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data)

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ Save token in localStorage
      localStorage.setItem("auth_token", data.token);

      // ✅ Refresh auth context BEFORE navigating
      await refreshAuth();
      setLoading(false);

      // Small delay to ensure auth state is updated
      await new Promise((resolve) => setTimeout(resolve, 300));

router.replace("/consignment/list");
      toast.success("done")
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
<<<<<<< HEAD
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="rounded-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                  <ShieldCheck size={28} className="sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Sign in to your account
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 p-3 rounded-lg">
                  {error}
                </div>
=======
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-4">
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
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <ShieldCheck size={32} className="drop-shadow-lg" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Welcome Back
                </h2>
                <p className="text-sm text-slate-600">
                  Sign in to your logistic account
                </p>
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
>>>>>>> 9c0a7788a7c9d26fcd1ff1eb34825bcfbdbe4f38
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
<<<<<<< HEAD
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <Mail size={18} className="text-blue-500" />
                    Email Address
=======
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail size={16} className="text-blue-600" /> Email Address
>>>>>>> 9c0a7788a7c9d26fcd1ff1eb34825bcfbdbe4f38
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                </motion.div>

                {/* Password */}
<<<<<<< HEAD
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <Lock size={18} className="text-blue-500" />
                    Password
=======
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Lock size={16} className="text-blue-600" /> Password
>>>>>>> 9c0a7788a7c9d26fcd1ff1eb34825bcfbdbe4f38
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                </motion.div>

                {/* Button */}
<<<<<<< HEAD
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-semibold rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-600 text-sm">
                  Don&apos;t have an account?{" "}
                  <span
                    className="text-blue-600 font-semibold cursor-pointer hover:text-indigo-600 hover:underline transition-colors duration-200"
                    onClick={() => router.push('/signup')}
                  >
                    Sign up
                  </span>
                </p>
              </div>
=======
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    type="submit"
                    className="w-full rounded-lg text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
              <motion.p
                className="text-center text-sm text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 hover:underline transition-colors"
                  onClick={() => router.push("/signup")}
                >
                  Sign up
                </button>
              </motion.p>
>>>>>>> 9c0a7788a7c9d26fcd1ff1eb34825bcfbdbe4f38
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}