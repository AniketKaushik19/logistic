'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import Router from 'next/router';
import { AdminNav } from '@/app/components/AdminNav';
import Navbar from '@/app/_components/Navbar';
import toast from 'react-hot-toast';

export default function Vehicle({ params }) {
  const  id  = use(params).id;
  const [Expenses, setExpenses] = useState([]);
  const [Amount, setAmount] = useState('');
  const [eDate, setEDate] = useState('');
  const [title, setTitle]=useState("")
  const [response, setResponse] = useState('');

  const getLatestExpenses=async(vehicleId)=>{
    try{
            const token = localStorage.getItem("auth_token");

     const response=await fetch(`/api/expense?vehicleId=${vehicleId}`, {
   cache: "no-store",
   headers: {
     Authorization: `Bearer ${token}`,
   },
 });
     const data=await response.json();
     if(data.status==="200"){
        setExpenses(data.expenses)
     }
     else{
       console.error("Failed to fetch expenses:",data.error)
     }
  }
  catch(error){
    console.error("Error fetching expenses:",error)
  }
}
  useEffect(() => {
    if (response) {
      const timer = setTimeout(() => {
        setResponse('');
      }, 5000);
      return () => clearTimeout(timer);
    }
    getLatestExpenses(id);
  }, [response]);

  const addExpense = async() => {
    if(!Amount || !eDate || !title){
       toast.error("Please fill all fields")
    }
    if (Amount) {
      const newExpense = {
        Amount: Amount,
        date: eDate,
        title:title,
        vehicleId: id,
        createdAt: new Date().toISOString()
      };

      try {
        // Send POST request to your API route
              const token = localStorage.getItem("auth_token");

        const res = await fetch("/api/expense", {
   cache: "no-store",
   method: "POST",
   headers: {
     "Content-Type": "application/json",
     Authorization: `Bearer ${token}`,
    },
          body: JSON.stringify(newExpense), // send the new order data
        });

        const data = await res.json();

        if (res.ok) {
          toast.success('Expense saved successfully!');
          setAmount('');
          setEDate('');
          setTitle('')
        } else {
          toast.error(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Error saving fuel expense:', error);
        toast.error('Error saving fuel expense. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

        {/*Navbar for Vehicle page*/ }
        <Navbar/>
      <main className="container px-4 py-8 mt-12">
        <div className="grid grid-cols-1 gap-8">
          {/* Expenses Section */}
          <div className="bg-gradient-to-br from-white to-blue-50 shadow-xl rounded-xl p-6 border border-blue-200 lg:w-250 lg:mx-auto">
             <h2 className='text-center text-xl font-semibold p-1'>{id}</h2>
        
            {/*  Expenses */}
            <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-3 text-green-800 flex items-center">
                <span className="mr-2">💵</span>  Expenses
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
                  placeholder="Amount (₹)"
                  value={Amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-gray-800"
                />
                <input
                  type="date"
                  value={eDate}
                  onChange={(e) => setEDate(e.target.value)}
                  className="p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-green-700"
                />
                <div>

                <button onClick={addExpense} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-md">
                  Add Expense
                </button>
                </div>
              </div>

              {/* //expense list  */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <span className='p-2 text-green-500 flex justify-end-safe hover:cursor-pointer hover:text-green-600'>
                  <Link href={`/vehicle/${id}/expenses`}>
                  view all
                  </Link>
                  </span>
                {Expenses?.map((expense, index) => (
                  <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-green-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-700">₹{expense.Amount}</span>
                      <span className="font-medium text-orange-600">{expense.title}</span>
                      <span className="text-sm text-gray-500">{expense.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}