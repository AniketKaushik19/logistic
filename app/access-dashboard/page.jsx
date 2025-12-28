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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl animate-scaleIn">
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
            onClick={() => {
              onConfirm({ adminEmail: email, adminPassword: password });
              onClose();
            }}
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-[340px] shadow-2xl animate-scaleIn">
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
            onClick={() => {
              onSave(password);
              onClose();
            }}
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
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState(null);
  const [action, setAction] = useState(null);

  const [ceoModal, setCeoModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  /* ================= FETCH ADMINS ================= */
  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch("/api/admin/access", {
        method: "GET",
        credentials: "include",
        cache: "no-store",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  if (!res.ok) {
      throw new Error("API failed");
    }
          const data = await res.json();
      setAdmins(data.admins || []);
    } catch {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  /* ================= CONFIRM ================= */
  const handleCeoConfirm = async (ceo) => {
    try {
      const token = localStorage.getItem("auth_token");

      const body = action === "edit" ? { ...ceo, password: newPassword } : ceo;

      const res = await fetch(`/api/admin/access/${selectedId}`, {
        method: action === "edit" ? "PUT" : "DELETE",
        credentials: "include",
        cache: "no-store",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(data.error);
      const data = await res.json();

      toast.success(action === "edit" ? "Password updated" : "Admin deleted");
      fetchAdmins();
    } catch (err) {
      toast.error(err.message || "Action failed");
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <p className="p-10 text-center flex gap-5 my-20 justify-center">
          <Loader className="text-5xl text-purple-500 transition-all animate-spin tracking-tight"/>
          <p className=" text-2xl text-purple-500">
               Loading Dashbord ...
            </p>
        </p>{" "}
      </>
    );

  return (
    <>
      <Navbar />
      <div className="p-10 min-h-screen bg-linear-to-br from-indigo-50 to-purple-100 mt-15 md:mt-10">
        <div className="flex items-center gap-2 md:justify-between md:m-8">
          <h1 className="md:text-3xl font-bold">Admin Access Control</h1>
          <Link href={"/adminAccess"}>
            <button
              onClick={() => setGiveAccessOpen(true)}
              className="flex items-center px-1.5 py-1 gap-2 md:px-5 md:py-2.5 rounded-xl
               bg-linear-to-r from-indigo-600 to-purple-600
               text-white font-semibold shadow-lg
               hover:shadow-xl hover:-translate-y-0.5 transition-all mb-2"
            >
              + Give Access
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {admins.map((admin) => (
            <div
              key={admin._id}
              className="relative bg-white rounded-3xl p-6 shadow-xl transform transition-all hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl"
            >
              {/* ICONS */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedId(admin._id);
                    setAction("edit");
                    setPasswordModal(true);
                  }}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => {
                    setSelectedId(admin._id);
                    setAction("delete");
                    setCeoModal(true);
                  }}
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* CONTENT */}
              <div className="mt-6">
                <h2 className="text-xl font-bold text-indigo-700">
                  {admin.name || "Admin"}
                </h2>
                <p className="text-sm text-gray-600">{admin.email}</p>
                <span className="inline-block mt-3 px-3 py-1 text-xs rounded-full bg-indigo-600 text-white">
                  ADMIN
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* MODALS */}
        <PasswordModal
          open={passwordModal}
          onClose={() => setPasswordModal(false)}
          onSave={(pwd) => {
            setNewPassword(pwd);
            setAction("edit");
            setPasswordModal(false);
            setCeoModal(true);
          }}
        />

        <CeoVerifyModal
          open={ceoModal}
          onClose={() => setCeoModal(false)}
          onConfirm={handleCeoConfirm}
        />
      </div>
    </>
  );
}
