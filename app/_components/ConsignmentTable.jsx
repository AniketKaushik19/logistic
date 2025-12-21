import React from "react";

function ConsignmentTable({ data }) {
  if (!data || !data.success) return null;

  const c = data.consignment;

  const statusColor =
    c.status === "Delivered"
      ? "bg-green-100 text-green-700"
      : c.status === "In Transit"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-blue-100 text-blue-700";

  return (
    <div className="mt-8 bg-white shadow-xl rounded-xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800">
          Consignment Details
        </h2>
        <span
          className={`mt-2 sm:mt-0 inline-block px-4 py-1 rounded-full text-sm font-semibold ${statusColor}`}
        >
          {c.status}
        </span>
      </div>

      {/* Details Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
          <tbody className="divide-y divide-gray-200">
            {row("Consignment No", c.cn, "From", c.fromLocation)}
            {row("Consignor", c.consignorName, "To", c.toLocation)}
            {row("Consignee", c.consigneeName, "Packages", c.packageCount)}
            {row("Weight (Kg)", c.weight, "Freight", c.freight)}
            {row("Invoice Value", c.invoiceValue, "Amount", c.amount)}
            {row("Payment Type", c.paymentType, "Date", c.consignmentDate)}
            {fullRow("Goods Description", c.goodsDescription)}
            {row("Lorry No", c.lorryNo, "Vehicle No", c.vehicleNo)}
            {row("Driver", c.driverName, "Status", c.status)}
          </tbody>
        </table>
      </div>

      {/* Assignment History */}
      {data.assignments?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Assignment History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="th">Assigned At</th>
                  <th className="th">Assigned To</th>
                  <th className="th">Vehicle</th>
                  <th className="th">Status</th>
                  <th className="th">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.assignments.map((a, i) => (
                  <tr
                    key={i}
                    className="hover:bg-blue-50 transition"
                  >
                    <td className="td">{a.assignedAt || a.createdAt || "-"}</td>
                    <td className="td">{a.assignedTo || a.driver || "-"}</td>
                    <td className="td">{a.vehicleNo || "-"}</td>
                    <td className="td">
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                        {a.status || "-"}
                      </span>
                    </td>
                    <td className="td">{a.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */

const row = (l1, v1, l2, v2) => (
  <tr className="hover:bg-gray-50">
    <Label>{l1}</Label>
    <Value>{v1}</Value>
    <Label>{l2}</Label>
    <Value>{v2}</Value>
  </tr>
);

const fullRow = (label, value) => (
  <tr className="hover:bg-gray-50">
    <Label>{label}</Label>
    <td colSpan={3} className="px-4 py-3 text-gray-700">
      {value}
    </td>
  </tr>
);

const Label = ({ children }) => (
  <th className="bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700 w-1/4">
    {children}
  </th>
);

const Value = ({ children }) => (
  <td className="px-4 py-3 text-gray-700 w-1/4">
    {children || "-"}
  </td>
);

export default ConsignmentTable;
