"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to login page or dashboard
                router.push('/auth/login');
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-xl border">
          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-2xl font-bold">Create Account</h2>
              <p className="text-sm text-muted-foreground">
                Sign up to get started
              </p>
            </div>

            {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User size={16} /> Full Name
                  </label>
                  <Input
                    placeholder="Aniket Kaushik"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail size={16} /> Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock size={16} /> Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck size={16} /> Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Button */}
                <Button
                    type="submit"
                    className="w-full rounded-xl text-base"
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <span
                className="text-primary font-medium cursor-pointer hover:underline"
                onClick={() => router.push('/login')}
              >
                Sign in
              </span>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
