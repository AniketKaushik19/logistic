"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Vehicle({ params }) {
  const [id, setId] = useState(null);
  const [Expenses, setExpenses] = useState([]);
  const [Amount, setAmount] = useState("");
  const [TotalExpense, setTotalExpense] = useState("");
  const [eDate, setEDate] = useState("");
  const [title, setTitle] = useState("Total Lorry Hire");
  const [response, setResponse] = useState("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const getLatestExpenses = async (vehicleId) => {
    try {
      const response = await fetch(`/api/expense?vehicleId=${vehicleId}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "200") {
        setExpenses(data.expenses);
      } else {
        console.error("Failed to fetch expenses:", data.error);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const addExpense = async () => {
    if (!Amount || !eDate || !title) {
      toast.error("Please fill all fields");
    }
    if (Amount) {
      const newExpense = {
        Amount: Amount,
        date: eDate,
        title: title,
        vehicleId: id,
        totalExpense:TotalExpense,
        createdAt: new Date().toISOString(),
      };

      try {
        // Send POST request to your API route

        const res = await fetch("/api/expense", {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newExpense), // send the new order data
        });
        if (!res.ok) {
          throw new Error("API failed");
        }
        const data = await res.json();

        if (res.ok) {
          toast.success("Expense saved successfully!");
          setAmount("");
          setEDate("");
          setTitle("");
          setTotalExpense("Total Lorry Hire");
          getLatestExpenses(id);
        } else {
          toast.error(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Error saving fuel expense:", error);
        toast.error("Error saving fuel expense. Please try again.");
      }
    }
  };
  useEffect(() => {
    if (response) {
      const timer = setTimeout(() => {
        setResponse("");
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (id) {
      getLatestExpenses(id);
    }
  }, [response, id]);

  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="container px-4 ">
        <div className="grid grid-cols-1 gap-8">
          {/* Expenses Section */}
            <h2 className="text-center text-xl font-bold mt-2  p-1">{id}</h2>
            {/*  Expenses */}
            <div className="mb-6 bg-linear-to-br from-green-50 to-emerald-50 p-2 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-6 text-green-800 flex items-center">
                <span className="mr-2">💵</span> Expenses
              </h3>
              {/* //form  */}
              <div className="flex gap-2 mb-4 flex-col">
                <input
                  type="text"
                  placeholder="Enter the Expense Type"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-gray-800"
                />
                <input
                  type="number"
                  placeholder="Total Lorry hire (₹)"
                  value={Amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-gray-800"
                />
                <input
                  type="number"
                  placeholder="Total Expense (₹)"
                  value={TotalExpense}
                  onChange={(e) => setTotalExpense(e.target.value)}
                  className="flex-1 p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-gray-800"
                />
                <div className="relative">
                <input
                  type="date"
                  value={eDate}
                  placeholder="Select the date"
                  onChange={(e) => setEDate(e.target.value)}     
                  className="input"
                />
                 {!eDate && (
                        <span className="md:hidden  pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          Select  Date
                        </span>
                      )}
                      </div>
                <div>
                  <button
                    onClick={addExpense}
                    className="bg-linear-to-br from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-md"
                  >
                    Add Expense
                  </button>
                </div>
              </div>
            </div>
        
        </div>
      </main>
    </div>
  );
}
