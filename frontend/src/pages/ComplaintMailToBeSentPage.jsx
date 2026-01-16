import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
} from "@mui/material";
import Toast from "../components/Toast";
import { complaintEnquiry } from "../services/complaintEnquiryService";
import { complaintSentToHO } from "../services/complaintMailSentToHOService";

const columns = [
  { key: "complaint_number", label: "Complaint" },
  { key: "complaint_date", label: "Date" },
  { key: "customer_name", label: "Customer Name" },
  { key: "product_model", label: "Model" },
  { key: "product_serial_number", label: "Serial Number" },
  { key: "current_status", label: "Current Status" },
  { key: "export_flag", label: "Export" },
];

const ComplaintMailToBeSentPage = ({ selectedCompany }) => {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sendingHO, setSendingHO] = useState(false);

  const initParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const obj = {};
    for (const [k, v] of params.entries()) obj[k] = v;
    obj.mail_to_be_sent_complaints = "Y";
    if (selectedCompany) obj.complaint_head = selectedCompany;
    return obj;
  }, [location.search, selectedCompany]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    complaintEnquiry(initParams, 100, 0)
      .then((resp) => {
        if (mounted) {
          const arr = Array.isArray(resp) ? resp : [];
          const withFlag = arr.map((r) => ({ ...r, export_flag: r.export_flag || "N" }));
          setData(withFlag);
        }
      })
      .catch(() => {
        if (mounted) {
          setError({ message: "Failed to fetch mail-to-be-sent complaints.", type: "error" });
          setShowToast(true);
          setData([]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [initParams]);

  const handleToggleExport = (idx, newValue) => {
    setData((prev) => prev.map((row, i) => (i === idx ? { ...row, export_flag: newValue } : row)));
  };

  const handleExport = async () => {
    setExporting(true);
    const selected = data.filter((r) => r.export_flag === "Y");
    if (selected.length === 0) {
      setError({ message: "No records selected for export.", type: "warning" });
      setShowToast(true);
      setExporting(false);
      return;
    }
    // Prepare selected rows and open modal for export preview
    setSelectedRows(selected);
    setShowExportModal(true);
    setExporting(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
      <Paper
        elevation={5}
        sx={{
          pt: 3,
          pr: 3,
          pl: 3,
          pb: 2,
          borderRadius: 4,
          background: "#fbf8ff",
          maxWidth: 1100,
          width: "100%",
          boxSizing: "border-box",
          margin: "0 16px",
          overflowX: "auto",
        }}
      >
        <h2 className="text-xl font-semibold text-purple-800 mb-4 pb-2 border-b border-purple-500 justify-center flex items-center gap-2">
          Mails to be Sent to HO
        </h2>

        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "#f6f0fb" }}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{ fontWeight: 700, fontSize: 14, textAlign: "center", py: 1, ...(col.label.toLowerCase().includes("date") && { whiteSpace: "nowrap" }) }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} style={{ textAlign: "center", padding: 24 }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} style={{ textAlign: "center", padding: 24, color: "#666" }}>
                    No Records Found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow key={row.complaint_number || idx} sx={{ background: idx % 2 === 0 ? "#fbfbff" : "#fff" }}>
                    <TableCell sx={{ textAlign: "center", py: 0.5, fontWeight: 700, color: "#6b21a8" }}>
                      {row.complaint_number}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center", py: 0.5, whiteSpace: "nowrap" }}>{row.complaint_date}</TableCell>
                    <TableCell sx={{ textAlign: "center", py: 0.5 }}>{row.customer_name}</TableCell>
                    <TableCell sx={{ textAlign: "center", py: 0.5 }}>{row.product_model || "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", py: 0.5 }}>{row.product_serial_number || "-"}</TableCell>
                    <TableCell sx={{ textAlign: "center", py: 0.5 }}>{row.current_status}</TableCell>
                    <TableCell sx={{ textAlign: "center", py: 0.5 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleExport(idx, row.export_flag === "Y" ? "N" : "Y")}
                        style={{
                          width: "60px",
                          padding: "4px 0",
                          borderRadius: "6px",
                          border: "none",
                          background: row.export_flag === "Y" ? "#e3fcec" : "#ffe3e3",
                          color: row.export_flag === "Y" ? "#388e3c" : "#d32f2f",
                          fontWeight: 700,
                          fontSize: "15px",
                          cursor: "pointer",
                          boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
                          transition: "background 0.2s, color 0.2s",
                        }}
                        aria-label="Toggle Export"
                      >
                        {row.export_flag === "Y" ? "Yes" : "No"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))
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
              color: "#6b21a8",
              fontWeight: 700,
              fontSize: 17,
              background: "#f3e8ff",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              boxShadow: "0 1px 4px rgba(107,33,168,0.07)",
              display: "inline-block",
            }}
          >
            <span style={{ letterSpacing: 0.5 }}>Selected Records:</span>{" "}
            <span style={{ color: "#6b21a8", fontWeight: 600 }}>
              {data.filter((row) => row.export_flag === "Y").length}
            </span>
          </Typography>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || data.length === 0}
            style={{
              background: "#6b21a8",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              border: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              cursor: exporting ? "not-allowed" : "pointer",
              boxShadow: "0 1px 4px rgba(107,33,168,0.07)",
              opacity: exporting ? 0.7 : 1,
            }}
            aria-label="Export Selected"
          >
            {exporting ? "Preparing..." : "Export"}
          </button>
        </Box>

        {showToast && error && (
          <Toast
            message={error.message}
            resolution={error.resolution}
            type={error.type}
            onClose={() => setShowToast(false)}
          />
        )}
        {/* Export Modal */}
        {showExportModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.25)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: 32,
                minWidth: 400,
                boxShadow: "0 4px 24px rgba(25,118,210,0.18)",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 20, color: "#1976d2" }}>
                  Export Data
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  
                  <button
                    onClick={async () => {
                      setSendingHO(true);
                      try {
                        const complaintNumbers = selectedRows.map((r) => r.complaint_number);
                        await complaintSentToHO(complaintNumbers);
                        setError({ message: "Complaints sent to HO", type: "success" });
                        setShowToast(true);
                        setShowExportModal(false);
                        // Optionally clear export flags for sent rows                        
                          // Refresh the page after a short delay so toast is visible
                          setTimeout(() => {
                            window.location.reload();
                          }, 900);
                      } catch (err) {
                        setError({ message: err?.message || "Failed to send to HO.", type: "error", resolution: "Please try again later." });
                        setShowToast(true);
                      } finally {
                        setSendingHO(false);
                      }
                    }}
                    disabled={sendingHO}
                    style={{
                      background: "#6b21a8",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 16px",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: sendingHO ? "not-allowed" : "pointer",
                    }}
                  >
                    {sendingHO ? "Sent..." : "Sent to HO"}
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    style={{
                      background: "#e53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 14px",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: 8,
                }}
              >
                <thead>
                  <tr>
                    {[
                      { key: "complaint_number", label: "Complaint" },
                      { key: "complaint_date", label: "Date" },
                      { key: "customer_name", label: "Customer Name" },
                      { key: "product_model", label: "Model" },
                      { key: "product_serial_number", label: "Serial Number"},
                      { key: "current_status", label: "Current Status"},
                    ].map((col) => (
                      <th
                        key={col.key}
                        style={{
                          background: "#e3eafc",
                          color: "#1976d2",
                          fontWeight: 700,
                          fontSize: 15,
                          border: "1px solid #d1d5db",
                          padding: "6px 10px",
                          textAlign: "center",
                        }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: 12, color: "#888" }}>
                        No data to export
                      </td>
                    </tr>
                  ) : (
                    selectedRows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ border: "1px solid #d1d5db", padding: "6px 10px", textAlign: "center", fontSize: 14 }}>
                          {typeof row.complaint_number === "string" && row.complaint_number.startsWith("N") ? (
                            <span style={{ visibility: "hidden" }}>{row.complaint_number}</span>
                          ) : (
                            row.complaint_number
                          )}
                        </td>
                        <td style={{ border: "1px solid #d1d5db", padding: "6px 10px", textAlign: "center", fontSize: 14 }}>
                          {row.complaint_date}
                        </td>
                        <td style={{ border: "1px solid #d1d5db", padding: "6px 10px", textAlign: "center", fontSize: 14 }}>
                          {row.customer_name}
                        </td>
                        <td style={{ border: "1px solid #d1d5db", padding: "6px 10px", textAlign: "center", fontSize: 14 }}>
                          {row.product_model || "-"}
                        </td>
                        <td style={{ border: "1px solid #d1d5db", padding: "6px 10px", textAlign: "center", fontSize: 14 }}>
                          {row.product_serial_number || "-"}
                        </td>
                        <td style={{ border: "1px solid #d1d5db", padding: "6px 10px", textAlign: "center", fontSize: 14 }}>
                          {row.current_status || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Paper>
    </div>
  );
};

export default ComplaintMailToBeSentPage;
