"use client"
import { Button } from "@/components/ui/button";
import { generateSalaryPDF } from "@/utils/generateSalaryPDF";
import { useState } from "react";
import toast from "react-hot-toast";
function SalaryActions({ driver, onClose }) {
  const [advance, setAdvance] = useState('');
  const [bonus, setBonus] = useState('');
  const [penalty, setPenalty] = useState('');
  const [loading, setLoading] = useState(false);


async function exportSalary(driverId) {
  const res = await fetch(`/api/driver/salary?driverId=${driverId}`, {
    credentials: "include",
  });

  if (!res.ok) {
    alert("Failed to load salary");
    return;
  }

  const salary = await res.json();
  console.log(salary)
  generateSalaryPDF(salary);
}


  const callApi = async (payload) => {
    setLoading(true);
    const res = await fetch('/api/driver/salary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    console.log(json)
    setLoading(false);

    if (!res.ok) throw new Error(json.error || 'Action failed');
    toast.success('Updated successfully');
  };

  return (
    <div className="space-y-4 mt-4 ">
      {/* Advance */}
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Advance Amount"
          className="input"
          value={advance}
          onChange={(e) => setAdvance(e.target.value)}
        />
        <Button className="hover:cursor-pointer"
          onClick={() => callApi({ driverId: driver._id, type: 'ADVANCE', amount: advance })}
        >
          Add Advance
        </Button>
      </div>

      {/* Bonus / Penalty */}
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Bonus (+)"
          className="input"
          value={bonus}
          onChange={(e) => setBonus(e.target.value)}
        />
        <input
          type="number"
          placeholder="Penalty (-)"
          className="input"
          value={penalty}
          onChange={(e) => setPenalty(e.target.value)}
        />
        <Button
          onClick={() =>
            callApi({
              driverId: driver._id,
              type: 'ADJUSTMENT',
              bonus,
              penalty,
            })
          }
          className="hover:cursor-pointer"
        >
          Save
        </Button>
      </div>

      {/* Mark Paid */}
      <Button
        className="w-full bg-green-600 hover:cursor-pointer"
        onClick={() =>
          callApi({ driverId: driver._id, type: 'MARK_PAID' })
        }
      >
        Mark Salary as Paid
      </Button>

      {/* Export PDF */}
      <Button
        variant="outline"
className="w-full hover:cursor-pointer"        
          onClick={() => exportSalary(driver._id)}
      >
        Export Salary Slip (PDF)
      </Button>

      <Button variant="ghost" className="hover:cursor-pointer" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}

export default SalaryActions;