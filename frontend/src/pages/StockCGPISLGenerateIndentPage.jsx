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
  Box,
} from "@mui/material";
import Toast from "../components/Toast";
import { fetchNextCGPISLIndentCode } from "../services/stockCGPISLNextIndentCodeService";
import { stockCGPISLPendingIndentByDivision } from "../services/stockCGPISLPendingIndentService";
import { generateCGPISLIndent } from "../services/stockCGPISLGenerateIndentService";

const columns = [
  { key: "spare_code", label: "Spare Code" },
  { key: "spare_description", label: "Spare Description" },
  { key: "indent_qty", label: "Quantity" },
  { key: "indent", label: "Generate" },
];

const divisionOptions = ["FANS", "PUMP", "SDA", "WHC", "FHP", "LT", "HT", "OTHERS"];

const initialForm = {
  indent_code: "",
  indent_date: new Date().toLocaleDateString("en-CA"),
  division: "",
};

// Suggestions for Received By

const StockCGPISLGenerateIndentPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef();
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState(initialForm);

  // Handler to toggle indent value for a row
  const handleIndent = (idx, newValue) => {
    setData((prevData) =>
      prevData.map((row, i) =>
        i === idx ? { ...row, indent: newValue } : row,
      ),
    );
  };
  //   Fetch next Indent Code on mount
  useEffect(() => {
    let mounted = true;
    fetchNextCGPISLIndentCode()
      .then((data) => {
        if (mounted && data) {
          setForm((prev) => ({
            ...prev,
            indent_code: data.next_cgpisl_indent_code || "",
          }));
        }
      })
      .catch(() => {
        setForm((prev) => ({ ...prev, indent_code: "" }));
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  //   Fetch data on mount
  useEffect(() => {
    let mounted = true;
    if (!form.division) return;
    setLoading(true);
    stockCGPISLPendingIndentByDivision(form.division)
      .then((result) => {
        if (mounted) {
          setData(Array.isArray(result) ? result : []);
        }
      })
      .catch((err) => {
        setError({
          message: err.message || "Failed to fetch records.",
          type: "error",
          resolution: "Please try again later.",
        });
        setShowToast(true);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [form.division]);

  // Handler for Create Indent button
  const handleCreateIndent = async () => {
    setUpdating(true);
    const selectedRows = data.filter((row) => row.indent === "Y");
    if (selectedRows.length === 0) {
      setError({
        message: "No records selected.",
        type: "warning",
        resolution: "Please select at least one record.",
      });
      setShowToast(true);
      setUpdating(false);
      return;
    }
    if (!form.indent_code) {
      setError({
        message: "Indent number is required.",
        resolution: "Refresh the page.",
        type: "warning",
      });
      setShowToast(true);
      setUpdating(false);
      return;
    }
    if (!form.division) {
      setError({
        message: "Division is required.",
        resolution: "Please select a division.",
        type: "warning",
      });
      setShowToast(true);
      setUpdating(false);
      return;
    }
    const payload = {
      indent_number: form.indent_code,
      division: form.division,
      spare_code: selectedRows.map((row) => row.spare_code),
    };
    try {
      await generateCGPISLIndent(payload);
      setError({
        message: "Indent created successfully!",
        type: "success",
        resolution: "Indent Number: " + form.indent_code,
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Indent creation failed",
        type: "error",
        resolution: "Please try again later.",
      });
      setShowToast(true);
    } finally {
      setUpdating(false);
    }
  };
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
          maxWidth: 900,
          width: "100%",
          boxSizing: "border-box",
          margin: "0 16px",
          overflowX: "auto",
        }}
      >
        <h2 className="text-xl font-semibold text-green-800 mb-4 pb-2 border-b border-green-500 justify-center flex items-center gap-2">
          Generate Spare Indent
        </h2>

        <form style={{ marginBottom: 24 }} autoComplete="off">
          {/* Indent Code Row */}
          <div className="flex items-center gap-3 justify-center mb-3">
            <label
              htmlFor="indent_code"
              className="text-md font-medium text-green-800"
            >
              Indent Code
            </label>
            <input
              id="indent_code"
              name="indent_code"
              type="text"
              value={form.indent_code}
              readOnly
              disabled
              autoComplete="off"
              className="w-34 text-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-medium cursor-not-allowed"
              style={{ minWidth: 120 }}
            />
          </div>
          {/* Division Dropdown Row */}
          <div className="flex items-center justify-center mb-2 mt-3 gap-5">
            <label
              htmlFor="division"
              className="text-md font-medium text-gray-700"
            >
              Division<span className="text-red-500">*</span>
            </label>
            <div className="w-20" style={{ minWidth: 120 }}>
              <select
                id="division"
                name="division"
                value={form.division}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, division: e.target.value }))
                }
                required
                className="w-full px-2 py-1 rounded-lg border border-gray-300 text-gray-900 font-small focus:outline-none focus:ring-2 focus:ring-green-400"
                style={{ minWidth: 140 }}
              >
                <option value="" disabled>
                  Select Division
                </option>
                {divisionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
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
              <TableRow sx={{ background: "#e8f5e9" }}>
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
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      color: "#888",
                      fontStyle: "italic",
                      padding: "24px 0",
                    }}
                  >
                    No Records Found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      background: idx % 2 === 0 ? "#f1f8f4" : "#fff",
                      height: 32,
                    }}
                  >
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
                        {col.key === "indent" ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleIndent(idx, row.indent === "Y" ? "N" : "Y")
                            }
                            style={{
                              width: "60px",
                              padding: "4px 0",
                              borderRadius: "6px",
                              border: "none",
                              background:
                                row.indent === "Y" ? "#e3fcec" : "#ffe3e3",
                              color: row.indent === "Y" ? "#388e3c" : "#d32f2f",
                              fontWeight: 700,
                              fontSize: "15px",
                              cursor: "pointer",
                              boxShadow: "0 1px 4px rgba(46,125,50,0.12)",
                              transition: "background 0.2s, color 0.2s",
                            }}
                            aria-label="Toggle Received"
                          >
                            {row.indent === "Y" ? "Yes" : "No"}
                          </button>
                        ) : row[col.key] !== null &&
                          row[col.key] !== undefined ? (
                          row[col.key]
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* </div> */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: "#2e7d32",
              fontWeight: 700,
              fontSize: 17,
              background: "#e8f5e9",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              boxShadow: "0 1px 4px rgba(46,125,50,0.12)",
              display: "inline-block",
            }}
          >
            <span style={{ letterSpacing: 0.5 }}>Selected Records:</span>{" "}
            <span style={{ color: "#1b5e20", fontWeight: 600 }}>
              {data.filter((row) => row.indent === "Y").length}
            </span>
          </Typography>
          <button
            type="button"
            onClick={handleCreateIndent}
            disabled={updating || data.length === 0}
            style={{
              background: "#2e7d32",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              border: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              cursor: updating ? "not-allowed" : "pointer",
              boxShadow: "0 1px 4px rgba(46,125,50,0.12)",
              opacity: updating ? 0.7 : 1,
              transition: "background 0.2s, color 0.2s",
            }}
            aria-label="Creating Indent Record"
          >
            {updating ? "Creating..." : "Create Indent"}
          </button>
        </Box>
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

export default StockCGPISLGenerateIndentPage;
