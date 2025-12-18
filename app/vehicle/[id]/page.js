'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
export default function VehiclePage({ params }) {
  const { id } = use(params);

  const [fuelExpenses, setFuelExpenses] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);
  const [orders, setOrders] = useState([]);

  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelDate, setFuelDate] = useState('');
  const [otherAmount, setOtherAmount] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [otherDate, setOtherDate] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [orderDestination, setOrderDestination] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (response) {
      const timer = setTimeout(() => {
        setResponse('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [response]);

  const addFuelExpense = async() => {
    if (fuelAmount && fuelDate) {
      const newExpense = {
        fuelAmount: fuelAmount,
        date: fuelDate,
        vehicleId: id,
        createdAt: new Date().toISOString()
      };

      try {
        // Send POST request to your API route
        const res = await fetch("/api/expense", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newExpense), // send the new order data
        });

        const data = await res.json();

        if (res.ok) {
          setResponse('Expense saved successfully!');
          setFuelAmount('');
          setFuelDate('');
        } else {
          setResponse(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Error saving fuel expense:', error);
        setResponse('Error saving fuel expense. Please try again.');
      }
    }
  };

  const addOtherExpense = async () => {
    if (otherAmount && otherDescription && otherDate) {
      const newOtherExpense={
        otherAmount:otherAmount,
        description:otherDescription,
        date:otherDate,
        vehicleId:id,
        createdAt:new Date().toISOString()
      }
      try {
        // Send POST request to your API route
        const res = await fetch("/api/expense", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newOtherExpense), // send the new other expense data
        });

        const data = await res.json();

        if (res.ok) {
          setOtherExpenses([...otherExpenses, newOtherExpense]);
          setResponse('Other expense saved successfully!');
          setOtherAmount('');
          setOtherDescription('');
          setOtherDate('');
        } else {
          setResponse(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Error saving other expense:', error);
        setResponse('Error saving ot. Please try again.');
      }
    }
  };

  const addOrder = async () => {
    if (orderDescription && orderDestination) {
      const newOrder = {
        description: orderDescription,
        destination: orderDestination,
        vehicleId: id,
        createdAt: new Date().toISOString()
      };

      try {
        // Send POST request to your API route
        const res = await fetch("/api/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newOrder), // send the new order data
        });

        const data = await res.json();

        if (res.ok) {
          setOrders([...orders, newOrder]);
          setResponse('Order saved successfully!');
          setOrderDescription('');
          setOrderDestination('');
        } else {
          setResponse(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Error saving order:', error);
        setResponse('Error saving order. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

        {/*Navbar for Vehicle page*/ }
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-white text-xl font-bold">🚛 Aniket Logistic</div>
              <Link href="/" className="text-white hover:text-orange-400 transition-colors flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </Link>
            </div>
            <div className="text-white">
              <h2 className="text-xl font-semibold"> {id}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <div>Status: Active</div>
                <div>Last Updated: Today</div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expenses Section */}
          <div className="bg-gradient-to-br from-white to-blue-50 shadow-xl rounded-xl p-6 border border-blue-200">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 text-white p-3 rounded-full mr-4">
                {/* <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg> */}
                <Image src="/rupees.png" alt="Fuel Icon" width={24} height={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
            </div>

            {/* Fuel Expenses */}
            <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-3 text-green-800 flex items-center">
                <span className="mr-2">⛽</span> Fuel Expenses
              </h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={fuelAmount}
                  onChange={(e) => setFuelAmount(e.target.value)}
                  className="flex-1 p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-gray-800"
                />
                <input
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-green-700"
                />
                <div>

                <button onClick={addFuelExpense} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-md">
                  Add Fuel
                </button>
                </div>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {fuelExpenses.map((expense, index) => (
                  <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-green-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-700">₹{expense.amount}</span>
                      <span className="text-sm text-gray-500">{expense.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Expenses */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold mb-3 text-orange-800 flex items-center">
                <span className="mr-2">🔧</span> Other Expenses
              </h3>
              <div className="space-y-3 mb-4">
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={otherAmount}
                  onChange={(e) => setOtherAmount(e.target.value)}
                  className="w-full p-3 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors placeholder-orange-400 text-gray-800"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value)}
                  className="w-full p-3 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors placeholder-orange-400 text-gray-800"
                />
                <input
                  type="date"
                  value={otherDate}
                  onChange={(e) => setOtherDate(e.target.value)}
                  className="w-full p-3 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors placeholder-orange-400 text-gray-800"
                />
                <button onClick={addOtherExpense} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-md">
                  Add Expense
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {otherExpenses.map((expense, index) => (
                  <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-orange-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-orange-700">${expense.otherExpenses}</span>
                      <span className="text-sm text-gray-500">{expense.description}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{expense.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-gradient-to-br from-white to-purple-50 shadow-xl rounded-xl p-6 border border-purple-200">
            <div className="flex items-center mb-6">
              <div className="bg-purple-500 text-white p-3 rounded-full mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-purple-800">Add New Order</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Order Description"
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                  className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors placeholder-purple-400 text-gray-800"
                />
                <input
                  type="text"
                  placeholder="Destination"
                  value={orderDestination}
                  onChange={(e) => setOrderDestination(e.target.value)}
                  className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors placeholder-purple-400 text-gray-800"
                />
                 
                <button onClick={addOrder} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-md">
                  Add Order
                </button>
                {response && (
                  <div className={`mt-3 p-3 rounded-lg text-center font-medium ${
                    response.includes('Error') || response.includes('Failed')
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {response}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {orders.map((
                order, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-purple-800">{order.description}</div>
                      <div className="text-sm text-gray-600 mt-1">📍 {order.destination}</div>
                    </div>
                    <div className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">
                      Active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}