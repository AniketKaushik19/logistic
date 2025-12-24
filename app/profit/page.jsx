"use client"
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Navbar from '../_components/Navbar';

export default function Page({id}){
    // const [profit, setProfit]=useState([])
    const [consign,setConsign]=useState("")
    const [netProfit,setNetProfit]=useState("")
    const [TotalCost,setTotalCost]=useState("")
    const [Expenses,setExpenses]=useState("")
    const [eDate , setEDate]=useState("")
    const [consignments, setConsignments] = useState([])

    useEffect(() => {
        fetchConsignments()
    }, [])

    useEffect(() => {
        const total = parseFloat(TotalCost) || 0
        const exp = parseFloat(Expenses) || 0
        const net = total - exp
        setNetProfit(net > 0 ? net.toFixed(2) : "")
    }, [TotalCost, Expenses])

    const fetchConsignments = async () => {
        try {
            const res = await fetch('/api/profit')
            const data = await res.json()
            setConsignments(data)
            console.log(data)
        } catch (error) {
            console.error('Failed to fetch consignments:', error)
        }
    }

    const handleConsignmentChange = (e) => {
        const value = e.target.value
        setConsign(value)
        const selectedConsignment = consignments.find(c => c.cn === value)
        if (selectedConsignment) {
            setTotalCost(selectedConsignment.amount || "")
            setEDate(selectedConsignment.createdAt ? new Date(selectedConsignment.createdAt).toISOString().split('T')[0] : "")
        } else {
            // For manual entry, don't auto-fill
        }
    }

    const addProfit=async()=>{
        if (!consign || !TotalCost || !Expenses || !netProfit || !eDate) {
            toast.error('Please fill all fields')
            return
        }

        const profitData = {
            consignmentNo: consign,
            totalCost: parseFloat(TotalCost),
            expenses: parseFloat(Expenses),
            netProfit: parseFloat(netProfit),
            date: eDate
        }

        try {
            const res = await fetch('/api/profit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profitData)
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Profit added successfully')
                // Reset form
                setConsign("")
                setTotalCost("")
                setExpenses("")
                setNetProfit("")
                setEDate("")
            } else {
                toast.error('Failed to add profit')
            }
        } catch (error) {
            console.error('Error adding profit:', error)
            toast.error('Error adding profit')
        }
    }
    return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

        {/*Navbar for Vehicle page*/ }
        <Navbar/>
      <main className="container px-4 py-8 mt-10">
        <div className="grid grid-cols-1 gap-8">
          {/* Profit Section */}
          <div className="bg-gradient-to-br from-white to-blue-50 shadow-xl rounded-xl p-6 border border-blue-200 lg:w-250 lg:mx-auto">
        
            {/*  Profit */}
            <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-3 text-green-800 flex items-center">
                <span className="mr-2">💵</span>  Profit
              </h3>
               {/* //form  */}
              <div className="flex gap-2 mb-4 flex-col">
                 <input
                  type="text"
                  placeholder="Enter or Select Consignment Number"
                  value={consign}
                  onChange={handleConsignmentChange}
                  list="consignment-list"
                  className="flex-1 p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-gray-800"
                />
                <datalist id="consignment-list">
                  {consignments.length>0? consignments.map((consignment) => (
                    <option key={consignment.createdAt} value={consignment.cn} />
                  )) : null}
                </datalist>
                <input
                  type="number"
                  placeholder="Total Cost (₹)"
                  value={TotalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  className="flex-1 p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-gray-800"
                />
                <input
                  type="number"
                  placeholder='Expense Cost '
                  value={Expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  className="p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-green-700"
                />
                <input
                  type="number"
                  placeholder='Net Profit (₹) '
                  value={netProfit}
                  readOnly
                  className="p-3 border-2 border-green-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <input
                  type="date"
                  value={eDate}
                  onChange={(e) => setEDate(e.target.value)}
                  className="p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors placeholder-green-400 text-green-700"
                />
                <div>

                <button onClick={addProfit} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-md">
                  Add Profit
                </button>
                </div>
              </div>         
            </div>

          </div>
        </div>
      </main>
    </div>
    )
}