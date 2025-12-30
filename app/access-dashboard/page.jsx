"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, Shield, Loader } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../_components/Navbar";
import Link from "next/link";

/* ================= CEO VERIFY MODAL ================= */
function CeoVerifyModal({ open, onClose, onConfirm }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center ">
      <div className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Shield className="text-indigo-600" />
          CEO Verification
        </h2>

        <input
          className="w-full mb-3 p-2 border rounded-lg"
          placeholder="CEO Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-2 border rounded-lg"
          placeholder="CEO Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ adminEmail: email, adminPassword: password })}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= PASSWORD MODAL ================= */
function PasswordModal({ open, onClose, onSave }) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) setPassword("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-[340px] shadow-2xl">
        <h2 className="text-lg font-bold mb-4">Update Password</h2>

        <input
          type="password"
          className="w-full mb-4 p-2 border rounded-lg"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            onClick={() => onSave(password)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN PAGE ================= */
export default function AccessDashboard() {
  const [admins, setAdmins] = useState([]);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [ceoModal, setCeoModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  /* ================= RESET ================= */
  const resetState = () => {
    setSelectedId(null);
    setNewPassword("");
    setPasswordModal(false);
    setCeoModal(false);
  };

  /* ================= FETCH ADMINS ================= */
  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch("/api/admin/access", {
        credentials: "include",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);

      setAdmins(data.admins || []);
      setCurrentAdminId(data.currentAdminId);
    } catch {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

const handlePasswordSave = async (password) => {
  if (!currentAdminId || typeof currentAdminId !== "string") {
    toast.error("Admin ID not ready. Please refresh.");
    return;
  }

  if (!password || password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  try {
    const res = await fetch("/api/admin/access", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminId: currentAdminId, // ✅ always send string
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to update password");
    }

    toast.success("Password updated successfully");
    resetState();
  } catch (err) {
    console.error("Password update error:", err);
    toast.error(err.message);
  }
};



  /* ================= DELETE ADMIN (CEO) ================= */
const handleCeoConfirm = async (ceo) => {
  if (!selectedId) {
    toast.error("Admin ID not selected");
    return;
  }

  try {
    const res = await fetch("/api/admin/access", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminId: selectedId,
        adminEmail: ceo.adminEmail,
        adminPassword: ceo.adminPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Delete failed");

    toast.success("Admin deleted successfully");
    fetchAdmins();
    resetState();
  } catch (err) {
    toast.error(err.message);
  }
};

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] gap-4">
          <Loader className="animate-spin text-purple-600" />
          <span className="text-xl text-purple-600">Loading Dashboard...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-10 min-h-screen bg-linear-to-br from-indigo-50 to-purple-100">
        <div className="flex gap-4 md:justify-between items-center mt-15 mb-5 md:my-15">
          <h1 className="md:text-3xl font-bold">Admin Access Control</h1>
          <Link href="/adminAccess">
            <button className="px-2 md:px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">
              + Access
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {admins.map((admin) => (
            <div
              key={admin._id}
              className="relative bg-white rounded-3xl p-6 shadow-xl"
            >
              <div className="absolute top-4 right-4 flex gap-2">
                {/* ✅ Edit ONLY self */}
                {admin._id === currentAdminId && (
                  <button
                    onClick={() => setPasswordModal(true)}
                    className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                  >
                    <Pencil size={16} />
                  </button>
                )}

                {/* ❌ Delete others only (CEO) */}
                {admin._id !== currentAdminId && (
                  <button
                    onClick={() => {
                      setSelectedId(admin._id);
                      setCeoModal(true);
                    }}
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-bold text-indigo-700 mt-6">
                {admin.name || "Admin"}
              </h2>
              <p className="text-sm text-gray-600">{admin.email}</p>

              <span className="inline-block mt-3 px-3 py-1 text-xs rounded-full bg-indigo-600 text-white">
                ADMIN
              </span>
            </div>
          ))}
        </div>

        {/* MODALS */}
        <PasswordModal
          open={passwordModal}
          onClose={resetState}
          onSave={handlePasswordSave}
        />

        <CeoVerifyModal
          open={ceoModal}
          onClose={resetState}
          onConfirm={handleCeoConfirm}
        />
      </div>
    </>
  );
}
