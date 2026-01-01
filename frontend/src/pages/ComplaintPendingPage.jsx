import React, { useState } from 'react';


const dummyData = [
  {
    id: 1,
    complaint: 'Network Issue',
    complaint_type: 'CGCEL',
    complaint_priority: 'NORMAL',
    complaint_status: 'NEW',
    division: 'FANS',
    date: '2025-12-20',
  },
  {
    id: 2,
    complaint: 'Software Bug',
    complaint_type: 'CGPISL',
    complaint_priority: 'URGENT',
    complaint_status: 'PENDING',
    division: 'PUMP',
    date: '2025-12-22',
  },
  {
    id: 3,
    complaint: 'Hardware Failure',
    complaint_type: 'CGCEL',
    complaint_priority: 'CRM-ESCALATION',
    complaint_status: 'CLOSED',
    division: 'MOTOR',
    date: '2025-12-25',
  },
  {
    id: 4,
    complaint: 'Login Issue',
    complaint_type: 'CGPISL',
    complaint_priority: 'HO-ESCALATION',
    complaint_status: 'FRESH',
    division: 'FANS',
    date: '2025-12-23',
  },
  {
    id: 5,
    complaint: 'App Crash',
    complaint_type: 'CGCEL',
    complaint_priority: 'URGENT',
    complaint_status: 'PENDING',
    division: 'PUMP',
    date: '2025-12-24',
  },
  // ...more dummy rows
];



const ComplaintPendingPage = (props) => {

  // Use only props.selectedCompany
  const selectedType = props.selectedCompany;

  const [filters, setFilters] = useState({
    complaint_priority: '',
    complaint_status: '',
    division: '',
    date: '',
    search: '',
  });

  // Button colors (same as MenuDashboardPage)
  const companyButtonStyles = {
    CGPISL: { backgroundColor: '#22c55e' },
    CGCEL: { backgroundColor: '#2563eb' },
    ALL: { backgroundColor: 'purple' },
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Filter by selectedType (complaint_type) and other filters
  const filteredData = dummyData.filter((row) => {
    const typeMatch =
      selectedType === 'ALL' || row.complaint_type === selectedType;
    return (
      typeMatch &&
      (!filters.complaint_priority || row.complaint_priority === filters.complaint_priority) &&
      (!filters.complaint_status || row.complaint_status === filters.complaint_status) &&
      (!filters.division || row.division === filters.division) &&
      (!filters.date || row.date === filters.date) &&
      (!filters.search || row.complaint.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Complaint Pending Page</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <select name="complaint_priority" value={filters.complaint_priority} onChange={handleChange}>
          <option value="">All Priorities</option>
          <option value="NORMAL">NORMAL</option>
          <option value="HO-ESCALATION">HO-ESCALATION</option>
          <option value="CRM-ESCALATION">CRM-ESCALATION</option>
          <option value="URGENT">URGENT</option>
        </select>
        <select name="complaint_status" value={filters.complaint_status} onChange={handleChange}>
          <option value="">All Status</option>
          <option value="NEW">NEW</option>
          <option value="PENDING">PENDING</option>
          <option value="FRESH">FRESH</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <select name="division" value={filters.division} onChange={handleChange}>
          <option value="">All Divisions</option>
          <option value="FANS">FANS</option>
          <option value="PUMP">PUMP</option>
          <option value="MOTOR">MOTOR</option>
        </select>
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleChange}
        />
        <input
          type="text"
          name="search"
          placeholder="Search complaint..."
          value={filters.search}
          onChange={handleChange}
        />
      </div>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Complaint</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Division</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.complaint}</td>
                <td>{row.complaint_type}</td>
                <td>{row.complaint_priority}</td>
                <td>{row.complaint_status}</td>
                <td>{row.division}</td>
                <td>{row.date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>No complaints found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintPendingPage;
