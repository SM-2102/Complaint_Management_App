
import React, { useState } from "react";

const dummyData = [
  {
    id: 1001,
    customer_name: "John Doe",
    division: "FANS",
    status: "Pending",
    remark: "Waiting for spare part",
  },
  {
    id: 1002,
    customer_name: "Jane Smith",
    division: "PUMP",
    status: "Closed",
    remark: "Issue resolved",
  },
  {
    id: 1003,
    customer_name: "Alice Brown",
    division: "LIGHT",
    status: "In Progress",
    remark: "Technician assigned",
  },
  {
    id: 1004,
    customer_name: "Bob Lee",
    division: "WHC",
    status: "Pending",
    remark: "Customer not available",
  },
  {
    id: 1005,
    customer_name: "Charlie Green",
    division: "SDA",
    status: "Pending",
    remark: "Parts ordered",
  },
  // ...more dummy rows
];

const ComplaintPendingPage = (props) => {
  // Use only props.selectedCompany
  const selectedType = props.selectedCompany;

  const [filters, setFilters] = useState({
    division: "",
    complaint_type: "",
    complaint_priority: "",
    action_head: "",
    spare_pending: "",
    final_status: "",
    action_by: "",
    date: "",
    customer_search: "",
    complaint_number: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Filter logic for all fields
  const filteredData = dummyData.filter((row) => {
    return (
      (!filters.division || row.division === filters.division) &&
      (!filters.complaint_type || row.complaint_type === filters.complaint_type) &&
      (!filters.complaint_priority || row.complaint_priority === filters.complaint_priority) &&
      (!filters.action_head || row.action_head === filters.action_head) &&
      (!filters.spare_pending || row.spare_pending === filters.spare_pending) &&
      (!filters.final_status || row.final_status === filters.final_status) &&
      (!filters.action_by || row.action_by === filters.action_by) &&
      (!filters.date || row.date === filters.date) &&
      (!filters.customer_search ||
        row.customer_name.toLowerCase().includes(filters.customer_search.toLowerCase()) ||
        (row.phone_number && row.phone_number.includes(filters.customer_search))
      ) &&
      (!filters.complaint_number || String(row.id).includes(filters.complaint_number))
    );
  });

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="w-full">
        {/* Removed heading as requested */}
        <div className="bg-white/90 rounded-3xl shadow-2xl p-4 md:p-6 mb-8 border border-indigo-100 backdrop-blur-sm">
          <form className="flex flex-wrap gap-4 md:gap-6 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Division</label>
              <select name="division" value={filters.division} onChange={handleChange} className="input-select">
                <option value="">All Divisions</option>
                <option value="FANS">FANS</option>
                <option value="APPL">APPL</option>
                <option value="LIGHT">LIGHT</option>
                <option value="WHC">WHC</option>
                <option value="SDA">SDA</option>
                <option value="PUMP">PUMP</option>
                <option value="LT MOTOR">LT MOTOR</option>
                <option value="FHP MOTOR">FHP MOTOR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Complaint Type</label>
              <select name="complaint_type" value={filters.complaint_type} onChange={handleChange} className="input-select">
                <option value="">All Types</option>
                <option value="Service Sale">Service Sale</option>
                <option value="Install">Install</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
              <select name="complaint_priority" value={filters.complaint_priority} onChange={handleChange} className="input-select">
                <option value="">All Priorities</option>
                <option value="NORMAL">NORMAL</option>
                <option value="HO-ESCALATION">HO-ESCALATION</option>
                <option value="CRM-ESCALATION">CRM-ESCALATION</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Action Head</label>
              <select name="action_head" value={filters.action_head} onChange={handleChange} className="input-select">
                <option value="">All Action Heads</option>
                <option value="Indent to be done">Indent to be done</option>
                <option value="Mail to be sent">Mail to be sent</option>
                <option value="Mail sent">Mail sent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Spare Pending?</label>
              <select name="spare_pending" value={filters.spare_pending} onChange={handleChange} className="input-select">
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Final Status?</label>
              <select name="final_status" value={filters.final_status} onChange={handleChange} className="input-select">
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Action By</label>
              <select name="action_by" value={filters.action_by} onChange={handleChange} className="input-select">
                <option value="">All</option>
                <option value="Employee">Employee</option>
                <option value="CCO">CCO</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
              <input type="date" name="date" value={filters.date} onChange={handleChange} className="input-select" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Customer/Phone</label>
              <input
                type="text"
                name="customer_search"
                placeholder="Search by customer name or phone..."
                value={filters.customer_search}
                onChange={handleChange}
                className="input-select"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Complaint #</label>
              <input
                type="text"
                name="complaint_number"
                placeholder="Search by complaint number..."
                value={filters.complaint_number}
                onChange={handleChange}
                className="input-select"
              />
            </div>
          </form>
        </div>
        <div className="bg-white/90 rounded-3xl shadow-2xl overflow-x-auto border border-indigo-100 backdrop-blur-sm">
          <table className="min-w-full divide-y divide-indigo-200">
            <thead className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider drop-shadow">Complaint #</th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider drop-shadow">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider drop-shadow">Division</th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider drop-shadow">Status</th>
                <th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider drop-shadow">Remark</th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-indigo-50">
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-50/60 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-indigo-700 drop-shadow">{row.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-800 font-medium">{row.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-blue-700 font-semibold">{row.division}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base">
                      <span
                        className={
                          row.status === "Pending"
                            ? "inline-block px-3 py-1 rounded-full text-xs font-bold bg-yellow-200 text-yellow-900 shadow"
                            : row.status === "Closed"
                            ? "inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-900 shadow"
                            : row.status === "In Progress"
                            ? "inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-200 text-blue-900 shadow"
                            : "inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-900 shadow"
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 italic">{row.remark}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-indigo-300 text-xl font-semibold italic">
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Tailwind custom input-select style */}
      <style>{`
        .input-select {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #c7d2fe;
          background: #f8fafc;
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          color: #3730a3;
          font-weight: 500;
          box-shadow: 0 1px 2px 0 #6366f11a;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .input-select:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px #6366f155;
        }
      `}</style>
    </div>
  );
};

export default ComplaintPendingPage;
