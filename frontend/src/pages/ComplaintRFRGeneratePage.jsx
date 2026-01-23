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
import { fetchNextRFRNumber } from "../services/complaintNextRFRNumberService";
import { fetchGenerateRFRList } from "../services/complaintGenerateRFRListService";
import { validateGenerateRFR } from "../utils/complaintGenerateRFRValidation";
import { generateRFR } from "../services/complaintGenerateRFRService";

const columns = [
  { key: "complaint_number", label: "Number" },
  { key: "customer_name", label: "Name" },
  { key: "product_model", label: "Model" },
  { key: "product_serial_number", label: "Serial No." },
  { key: "current_status", label: "Current Status" },
];

const divisionOptions = ["FANS", "PUMP", "LIGHT", "SDA", "WHC"];

const initialForm = {
  product_division: "",
  rfr_type: "",
  product_type: "",
  rfr_number: "",
};

// Suggestions for Received By

const ComplaintRFRGeneratePage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef();
  const [updating, setUpdating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddAnother, setShowAddAnother] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [rfrListLoading, setRfrListLoading] = useState(false);
  const [selected, setSelected] = useState([]); // array of complaint_number


  // Handler for Product Division change - fetch generate RFR list
  const handleDivisionChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, product_division: value }));
    // clear any previous list data / selections
    setData([]);
    setSelected([]);

    if (!value) {
      setData([]);
      return;
    }

    setRfrListLoading(true);
    try {
      const res = await fetchGenerateRFRList(value);
      // expect an array response; populate table
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      setData([]);
      setError({
        message: err?.message || "Failed to fetch RFR list",
        type: "error",
        resolution: err?.resolution || "Please try again later.",
      });
      setShowToast(true);
    } finally {
      setRfrListLoading(false);
    }
  };

  const toggleSelectOne = (complaintNumber) => {
    setSelected((prev) => {
      if (prev.includes(complaintNumber)) {
        return prev.filter((id) => id !== complaintNumber);
      }
      // If RFR type is SINGLE, always replace selection with the clicked item
      if (form.rfr_type === "SINGLE") {
        return [complaintNumber];
      }
      return [...prev, complaintNumber];
    });
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      // For SINGLE RFR type, only allow selecting the first record
      if (form.rfr_type === "SINGLE") {
        const first = Array.isArray(data) && data.length > 0 ? data[0].complaint_number : [];
        setSelected(first ? [first] : []);
      } else {
        setSelected(Array.isArray(data) ? data.map((r) => r.complaint_number) : []);
      }
    } else {
      setSelected([]);
    }
  };
  const [errs, errs_label] = validateGenerateRFR(form);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Ensure selection is trimmed when switching to SINGLE RFR type
  useEffect(() => {
    if (form.rfr_type === "SINGLE" && selected.length > 1) {
      setSelected((prev) => (prev.length > 0 ? [prev[0]] : []));
    }
  }, [form.rfr_type]);

  // Open confirmation dialog after validating form and selection
  const handleSendRFR = (e) => {
    e.preventDefault();
    setError("");
    setShowToast(false);
    if (errs.length > 0) {
      setError({
        message: errs[0],
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    if (!selected || selected.length === 0) {
      setError({ message: "Select at least one complaint", type: "warning" });
      setShowToast(true);
      return;
    }
    setShowAddAnother(true);
  };

  // Actual send logic separated so it can be triggered from the modal
  const performSendRFR = async () => {
    setSubmitting(true);
    setUpdating(true);
    try {
      const payload = {
        complaint_numbers: selected,
        product_division: form.product_division,
        rfr_number: form.rfr_number,
        rfr_type: form.rfr_type,
        product_type: form.product_type,
      };
      await generateRFR(payload);
      setError({ message: "RFR generated successfully.",
        resolution: "RFR Number: " + form.rfr_number,
        type: "success" });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to generate RFR.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setUpdating(false);
      setSubmitting(false);
    }
  };

  const handleAddAnother = async (confirm) => {
    setShowAddAnother(false);
    if (confirm) {
      await performSendRFR();
    }
  };


  // Fetch next RFR number on mount and handle errors with toast
  useEffect(() => {
    let mounted = true;
    const loadNextRfr = async () => {
      try {
        const res = await fetchNextRFRNumber();
        if (!mounted) return;
        const rfrNumber = res.next_rfr_number;         
        setForm((prev) => ({ ...prev, rfr_number: rfrNumber || "" }));
      } catch (err) {
        if (!mounted) return;
        setForm((prev) => ({ ...prev, rfr_number: "" }));
        setError({
          message: err?.message || "Failed to fetch next RFR number",
          type: "error",
          resolution: err?.resolution || "Please try again later.",
        });
        setShowToast(true);
      }
    };
    loadNextRfr();
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
          maxWidth: 800,
          width: "100%",
          boxSizing: "border-box",
          margin: "0 16px",
          overflowX: "auto",
        }}
      >
        <h2 className="text-xl font-semibold text-purple-800 mb-4 pb-2 border-b border-purple-500 justify-center flex items-center gap-2">
          Generate RFR Record
        </h2>

        <form style={{ marginBottom: 24 }} autoComplete="off">
          <div className="flex flex-col items-center justify-center mb-2 gap-4">
            {/* First row: Division + RFR Number */}
            <div className="flex items-center justify-center gap-7 w-full">
              <div className="flex items-center w-1/2">
                <label
                  htmlFor="product_division"
                  className="text-md font-medium text-gray-700 w-34 mr-2 ml-2"
                >
                  Product Division<span className="text-red-500">*</span>
                </label>
                <div style={{ minWidth: 180 }}>
                  <select
                    id="product_division"
                    name="product_division"
                    value={form.product_division}
                    onChange={handleDivisionChange}
                    required
                    className={`w-full px-2 py-1 rounded-lg border ${errs_label.product_division ? 'border-red-300' : 'border-gray-300'} text-gray-900 font-small focus:outline-none focus:ring-2 focus:ring-purple-400`}
                  >
                    <option value="" disabled>
                      Select Division
                    </option>
                    {divisionOptions.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center w-1/2">
                <label
                  htmlFor="rfr_number"
                  className="text-md font-medium text-gray-700 w-36 mr-2 ml-1"
                >
                  RFR Number<span className="text-red-500">*</span>
                </label>
                <div style={{ minWidth: 160 }}>
                  <input
                    id="rfr_number"
                    name="rfr_number"
                    value={form.rfr_number}
                    readOnly
                    className={`w-full px-2 py-1 rounded-lg border ${errs_label.rfr_number ? 'border-red-300' : 'border-gray-300'} text-gray-900 font-small text-center focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-not-allowed`}
                  />
                </div>
              </div>
            </div>

            {/* Second row: RFR Type + Product Type */}
            <div className="flex items-center justify-center gap-7 w-full">
              <div className="flex items-center w-1/2">
                <label
                  htmlFor="product_type"
                  className="text-md font-medium text-gray-700 w-34 mr-2 ml-2"
                >
                  Product Type<span className="text-red-500">*</span>
                </label>
                <div style={{ minWidth: 180 }}>
                  <select
                    id="product_type"
                    name="product_type"
                    value={form.product_type}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-2 py-1 rounded-lg border ${errs_label.product_type ? 'border-red-300' : 'border-gray-300'} text-gray-900 font-small focus:outline-none focus:ring-2 focus:ring-purple-400`}
                  >
                    <option value="" disabled>
                      Select Type
                    </option>
                    <option value="UG">UG</option>
                    <option value="OW">OW</option>
                  </select>
                </div>
              </div>
               <div className="flex items-center w-1/2">
                <label
                  htmlFor="rfr_type"
                  className="text-md font-medium text-gray-700 w-38 ml-1"
                >
                  RFR Type<span className="text-red-500">*</span>
                </label>
                <div style={{ minWidth: 199 }}>
                  <select
                    id="rfr_type"
                    name="rfr_type"
                    value={form.rfr_type}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-2 py-1 rounded-lg border ${errs_label.rfr_type ? 'border-red-300' : 'border-gray-300'} text-gray-900 font-small focus:outline-none focus:ring-2 focus:ring-purple-400`}
                  >
                    <option value="" disabled>
                      Select RFR Type
                    </option>
                    <option value="SINGLE">SINGLE</option>
                    <option value="BULK">BULK</option>
                  </select>
                </div>
              </div>
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
                <TableCell sx={{ width: 36, textAlign: "center" }}>
                  <Checkbox
                    size="small"
                      indeterminate={selected.length > 0 && selected.length < (data.length || 0)}
                      checked={data.length > 0 && selected.length === data.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      disabled={form.rfr_type === "SINGLE"}
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
              {rfrListLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} style={{ textAlign: "center", padding: "24px 0" }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data && data.length > 0 ? (
                data.map((row, idx) => (
                  <TableRow
                    key={row.complaint_number ?? idx}
                    sx={{ background: idx % 2 === 0 ? "#f5f3ff" : "#fff", height: 32 }}
                  >
                    <TableCell sx={{ width: 36, textAlign: "center" }}>
                      <Checkbox
                        size="small"
                        checked={selected.includes(row.complaint_number)}
                        onChange={() => toggleSelectOne(row.complaint_number)}
                        inputProps={{ "aria-label": `select-${row.complaint_number}` }}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{ fontWeight: 500, textAlign: "center", py: 0.5, ...(col.label.toLowerCase().includes("date") && { whiteSpace: "nowrap" }) }}
                      >
                        {row[col.key] ?? "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} style={{ textAlign: "center", color: "#888", fontStyle: "italic", padding: "24px 0" }}>
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
            onClick={handleSendRFR}
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
            aria-label="Send RFR Mail"
          >
            {updating ? "Sending..." : "Send RFR"}
          </button>
        </Box>
        {/* </div> */}
        {showAddAnother && !showToast && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-40">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] flex flex-col items-center">
              <div className="text-lg font-semibold mb-4">Send RFR?</div>
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800"
                  onClick={() => handleAddAnother(true)}
                >
                  Yes
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => handleAddAnother(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
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

export default ComplaintRFRGeneratePage;
