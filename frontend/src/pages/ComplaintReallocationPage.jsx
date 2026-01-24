import React, { useEffect, useState, useRef } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Box,
} from "@mui/material";
import Toast from "../components/Toast";
import { fetchEmployees } from "../services/complaintEmployeesService";
import { allocatedDataToTechnician } from "../services/complaintReallocationListByTechnician";
import { reallocateComplaints } from "../services/complaintReallocationUpdateService";

const columns = [
  { key: "complaint_number", label: "Complaint Number" },
  { key: "complaint_date", label: "Date" },
  { key: "customer_name", label: "Customer Name" },
  { key: "customer_address", label: "Customer Address" },
  { key: "product_division", label: "Division" },
  { key: "current_status", label: "Current Status" },
];

const initialForm = {
  allocated_to: "",
  reallocate_to: "",
};

// Suggestions for Received By

const ComplaintReallocationPage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef();
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [employees, setEmployees] = useState([]);
  // Complaint allocation data state
  const [complaintAllocData, setComplaintAllocData] = useState([]);
  const [complaintAllocLoading, setComplaintAllocLoading] = useState(false);
  const [selected, setSelected] = useState([]); // array of complaint_number

  // Handler for allocated_to change
  const handleAllocatedToChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, allocated_to: value }));
    if (value) {
      setComplaintAllocLoading(true);
      try {
        const res = await allocatedDataToTechnician(value);
        setComplaintAllocData(Array.isArray(res) ? res : []);
      } catch (err) {
        setComplaintAllocData([]);
      } finally {
        setComplaintAllocLoading(false);
      }
    } else {
      setComplaintAllocData([]);
    }
  };

  // Handler for reallocate_to change (only updates form value)
  const handleReallocateToChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, reallocate_to: value }));
  };

  // Selection handlers
  const toggleSelectAll = (checked) => {
    if (checked) {
      const source =
        complaintAllocData && complaintAllocData.length > 0
          ? complaintAllocData
          : data;
      const ids = source
        .map((r) => {
          if (r === null || r === undefined) return null;
          if (typeof r === "string" || typeof r === "number") return r;
          return r.complaint_number ?? null;
        })
        .filter((id) => id !== null && id !== undefined);
      setSelected(ids);
    } else {
      setSelected([]);
    }
  };

  const toggleSelectOne = (complaintNumber) => {
    setSelected((prev) => {
      if (prev.includes(complaintNumber)) {
        return prev.filter((id) => id !== complaintNumber);
      }
      return [...prev, complaintNumber];
    });
  };

  // Handler for Reallocate button — calls reallocateComplaints service
  const handleReallocate = async () => {
    if (!form.allocated_to) {
      setError({
        message: "Old technician is required.",
        type: "warning",
        resolution: "Choose the technician allocated to.",
      });
      setShowToast(true);
      return;
    }
    if (!form.reallocate_to) {
      setError({
        message: "New technician is required.",
        type: "warning",
        resolution: "Choose the technician to reallocate to.",
      });
      setShowToast(true);
      return;
    }

    setUpdating(true);
    const payload = {
      complaint_numbers: selected,
      old_technician: form.allocated_to,
      new_technician: form.reallocate_to,
    };

    try {
      await reallocateComplaints(payload);
      setError({
        message: "Complaints reallocated successfully!",
        type: "success",
        resolution: `Reallocated to ${form.reallocate_to}.`,
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Reallocation failed",
        type: "error",
        resolution: "Please try again later.",
      });
      setShowToast(true);
    } finally {
      setUpdating(false);
    }
  };

  // Fetch technicians on mount
  useEffect(() => {
    let mounted = true;
    fetchEmployees()
      .then((res) => {
        if (mounted && res && Array.isArray(res.employees)) {
          setEmployees(res.employees);
        }
      })
      .catch(() => {
        setEmployees([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        padding: "20px 0",
      }}
    >
      <Paper
        elevation={5}
        sx={{
          pt: 3,
          pr: 3,
          pl: 3,
          pb: 2,
          borderRadius: 4,
          background: "#f8fafc",
          maxWidth: 1000,
          width: "100%",
          boxSizing: "border-box",
          margin: "0 16px",
          overflowX: "auto",
        }}
      >
        <h2 className="text-xl font-semibold text-purple-800 mb-4 pb-2 border-b border-purple-500 justify-center flex items-center gap-2">
          Complaint Reallocation
        </h2>

        <form style={{ marginBottom: 24 }} autoComplete="off">
          {/* Allocated to Dropdown Row */}
          <div className="flex items-center justify-center mb-2 mt-3 gap-5">
            <label
              htmlFor="allocated_to"
              className="text-md font-medium text-gray-700"
            >
              Allocated to<span className="text-red-500">*</span>
            </label>
            <div className="w-28.5" style={{ minWidth: 100 }}>
              <select
                id="allocated_to"
                name="allocated_to"
                value={form.allocated_to}
                onChange={handleAllocatedToChange}
                required
                className="w-full px-2 py-1 rounded-lg border border-gray-300 text-gray-900 font-small focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ minWidth: 160 }}
              >
                <option value="" disabled>
                  Select Technician
                </option>
                {employees.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-center mb-2 gap-5">
            {/* Reallocate to dropdown */}
            <label
              htmlFor="reallocate_to"
              className="text-md font-medium text-gray-700"
            >
              Reallocate to<span className="text-red-500">*</span>
            </label>
            <div className="w-30" style={{ minWidth: 100 }}>
              <select
                id="reallocate_to"
                name="reallocate_to"
                value={form.reallocate_to}
                onChange={handleReallocateToChange}
                className="w-full px-2 py-1 rounded-lg border border-gray-300 text-gray-900 font-small focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ minWidth: 160 }}
              >
                <option value="" disabled>
                  Select Employee
                </option>
                {employees.map((emp) => (
                  <option key={`re-${emp}`} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Table Section */}
        {/* <div ref={tableRef}> */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "#ede9fe" }}>
                <TableCell sx={{ width: 20, textAlign: "center" }}>
                  <Checkbox
                    size="small"
                    indeterminate={
                      selected.length > 0 &&
                      selected.length <
                        (complaintAllocData.length || data.length)
                    }
                    checked={
                      (complaintAllocData.length || data.length) > 0 &&
                      selected.length ===
                        (complaintAllocData.length || data.length)
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    inputProps={{ "aria-label": "select all complaints" }}
                  />
                </TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: 700,
                      fontSize: 16,
                      textAlign: "center",
                      py: 1,
                      ...(col.label.toLowerCase().includes("date") && {
                        whiteSpace: "nowrap",
                      }),
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Prefer complaintAllocData if present, otherwise fallback to data */}
              {complaintAllocLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    style={{ textAlign: "center", padding: "24px 0" }}
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : complaintAllocData && complaintAllocData.length > 0 ? (
                complaintAllocData.map((row, idx) => (
                  <TableRow
                    key={row.complaint_number || idx}
                    sx={{
                      background: idx % 2 === 0 ? "#f5f3ff" : "#fff",
                      height: 32,
                    }}
                  >
                    <TableCell sx={{ width: 48, textAlign: "center" }}>
                      <Checkbox
                        size="small"
                        checked={selected.includes(row.complaint_number)}
                        onChange={() => toggleSelectOne(row.complaint_number)}
                        inputProps={{
                          "aria-label": `select-${row.complaint_number}`,
                        }}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{
                          fontWeight: 500,
                          textAlign: "center",
                          py: 0.5,
                          ...(col.label.toLowerCase().includes("date") && {
                            whiteSpace: "nowrap",
                          }),
                        }}
                      >
                        {row[col.key] ?? "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data && data.length > 0 ? (
                data.map((row, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      background: idx % 2 === 0 ? "#f5f3ff" : "#fff",
                      height: 32,
                    }}
                  >
                    <TableCell sx={{ width: 48, textAlign: "center" }}>
                      <Checkbox
                        size="small"
                        checked={selected.includes(row.complaint_number)}
                        onChange={() => toggleSelectOne(row.complaint_number)}
                        inputProps={{
                          "aria-label": `select-${row.complaint_number}`,
                        }}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{
                          fontWeight: 500,
                          textAlign: "center",
                          py: 0.5,
                          ...(col.label.toLowerCase().includes("date") && {
                            whiteSpace: "nowrap",
                          }),
                        }}
                      >
                        {row[col.key] ?? "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    style={{
                      textAlign: "center",
                      color: "#888",
                      fontStyle: "italic",
                      padding: "24px 0",
                    }}
                  >
                    No Complaints Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: "#7c3aed",
              fontWeight: 700,
              fontSize: 17,
              background: "#ede9fe",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              boxShadow: "0 1px 4px rgba(124,58,237,0.07)",
              display: "inline-block",
            }}
          >
            <span style={{ letterSpacing: 0.5 }}>Selected Records:</span>{" "}
            <span style={{ color: "#5b21b6", fontWeight: 600 }}>
              {selected.length}
            </span>
          </Typography>
          <button
            type="button"
            onClick={handleReallocate}
            disabled={updating || selected.length === 0}
            style={{
              background: "#7c3aed",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              border: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              cursor: updating ? "not-allowed" : "pointer",
              boxShadow: "0 1px 4px rgba(124,58,237,0.07)",
              opacity: updating ? 0.7 : 1,
              transition: "background 0.2s, color 0.2s",
            }}
            aria-label="Reallocate Complaints"
          >
            {updating ? "Reallocating..." : "Reallocate"}
          </button>
        </Box>
        {/* </div> */}
        {showToast && (
          <Toast
            message={error.message}
            resolution={error.resolution}
            type={error.type}
            onClose={() => setShowToast(false)}
          />
        )}
      </Paper>
    </div>
  );
};

export default ComplaintReallocationPage;
