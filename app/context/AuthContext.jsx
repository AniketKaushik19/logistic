"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include", // ✅ REQUIRED - include cookies in request
        cache: "no-store", // ✅ Don't cache to ensure fresh auth state
      });
      const data = await res.json();
      setUser(data.authenticated ? data.user : null);
      return data.authenticated;
    } catch (error) {
      console.error("Auth fetch failed:", error);
      setUser(null);
      return false;
    }
  };

  const refreshAuth = async () => {
    return await fetchAuth();
  };

  useEffect(() => {
    setLoading(true);
    fetchAuth().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
