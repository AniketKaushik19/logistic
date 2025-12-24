"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresh auth using httpOnly cookie (server sets cookie on login)
  const refreshAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include", // important to send cookie
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        setUser(null);
        return { authenticated: false };
      }

      const data = await res.json();
 if (data?.user?.role=="admin") {
        setUser(data.user);
        return { authenticated: true, user: data.user };
      } else {
        setUser(null);
        return { authenticated: false };
      }
    } catch (err) {
      console.error("Auth refresh failed:", err);
      setUser(null);
      return { authenticated: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);