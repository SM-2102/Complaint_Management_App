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
import { FiSearch } from "react-icons/fi";
import { fetchNotReceivedGRCNumbers } from "../services/grcCGCELNotRceievedGRCNumberService";
import { fetchNotReceivedGRCDetails } from "../services/grcCGCELNotReceivedDetailsService";
import { receiveGRCSpare } from "../services/grcCGCELNotReceivedUpdateService";
import { stockCGCELListByDivision } from "../services/stockCGCELStockListByDivisionService";

const columns = [
  { key: "spare_code", label: "Spare Code" },
  { key: "spare_description", label: "Spare Description" },
  { key: "issue_qty", label: "Issue Qty" },
  { key: "receive_qty", label: "Receive Qty" },
  { key: "defective_qty", label: "Damage Qty" },
  { key: "short_qty", label: "Short Qty" },
  { key: "alt_spare_qty", label: "Alt. Spare Qty" },
  { key: "alt_spare_code", label: "Alt. Spare Code" },
  { key: "dispute_remark", label: "Dispute Remark" },
];

const initialForm = {
  grc_number: "",
  division: "",
};

// Suggestions for Received By

const GRCCGCELReceiveSparePage = () => {
  const [data, setData] = useState([]);
  // Handler for GRC Number search (defined later, after state hooks)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef();
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [grcSuggestions, setGrcSuggestions] = useState([]);
  const [showGrcSuggestions, setShowGrcSuggestions] = useState(false);
  const [stockList, setStockList] = useState([]);
  const [focusedAltIndex, setFocusedAltIndex] = useState(null);

  // fetch stock list helper
  const fetchStockByDivision = async (division) => {
    if (!division) {
      setStockList([]);
      return;
    }
    try {
      const res = await stockCGCELListByDivision(division);
      setStockList(Array.isArray(res) ? res : []);
    } catch (err) {
      setStockList([]);
    }
  };

  // Handler for GRC Number search
  const handleGrcSearch = async () => {
    if (!form.grc_number) return;
    // Check if GRC number is in the suggestions list
    if (!grcSuggestions.includes(form.grc_number)) {
      setError({
        message: "Invalid GRC Number.",
        resolution: "Select a GRC Number from suggestions.",
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetchNotReceivedGRCDetails(form.grc_number);
      setData(Array.isArray(result) ? result : []);
      const divisionValue =
        Array.isArray(result) && result.length > 0 ? result[0].division : "";
      setForm((prev) => ({ ...prev, division: divisionValue }));
      if (divisionValue) {
        await fetchStockByDivision(divisionValue);
      } else {
        setStockList([]);
      }
      if (!result || (Array.isArray(result) && result.length === 0)) {
        setError({
          message: "No details found for this GRC Number.",
          type: "warning",
          resolution: "Check the GRC Number or try another.",
        });
        setShowToast(true);
      }
    } catch (err) {
      setData([]);
      setError({
        message: err?.message || "Failed to fetch GRC details.",
        type: "error",
        resolution: "Please try again later.",
      });
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchNotReceivedGRCNumbers()
      .then((grcData) => {
        if (mounted) {
          setGrcSuggestions(Array.isArray(grcData) ? grcData : []);
        }
      })
      .catch(() => {
        setGrcSuggestions([]);
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Handler for Receive GRC button
  const handleReceiveGRC = async () => {
    setUpdating(true);
    // Prepare payload: all rows (or filter if needed)
    const payload = data.map((row) => ({
      spare_code: row.spare_code,
      grc_number: Number(form.grc_number),
      receive_qty: Number(row.receive_qty) ?? 0,
      defective_qty: Number(row.defective_qty) ?? 0,
      short_qty: Number(row.short_qty) ?? 0,
      alt_spare_qty: Number(row.alt_spare_qty) ?? 0,
      alt_spare_code: row.alt_spare_code ?? "",
      dispute_remark: row.dispute_remark ?? "",
      issue_qty: Number(row.issue_qty) ?? 0,
    }));
    if (payload.length === 0) {
      setError({
        message: "No records to update.",
        type: "warning",
        resolution: "Please fetch GRC details first.",
      });
      setShowToast(true);
      setUpdating(false);
      return;
    }
    // Validation: issue_qty = receive_qty + defective_qty + short_qty + alt_spare_qty for all records
    const invalidRows = payload.filter((row) => {
      const issue_qty = Number(row.issue_qty ?? 0);
      const receive_qty = Number(row.receive_qty ?? 0);
      const defective_qty = Number(row.defective_qty ?? 0);
      const short_qty = Number(row.short_qty ?? 0);
      const alt_spare_qty = Number(row.alt_spare_qty ?? 0);
      return (
        issue_qty !== receive_qty + defective_qty + short_qty + alt_spare_qty
      );
    });
    if (invalidRows.length > 0) {
      const failingSpareCode = invalidRows[0]?.spare_code || "Unknown";
      setError({
        message: `Quantity mismatch for ${failingSpareCode}`,
        type: "warning",
        resolution: "Review spare quantities.",
      });
      setShowToast(true);
      setUpdating(false);
      return;
    }

    // Validation: if alt_spare_qty is entered (> 0), alt_spare_code and dispute_remark are mandatory
    const altSpareMissingRows = payload.filter(
      (row) =>
        row.alt_spare_qty > 0 && (!row.alt_spare_code || !row.dispute_remark),
    );
    if (altSpareMissingRows.length > 0) {
      const failingSpareCode = altSpareMissingRows[0]?.spare_code || "Unknown";
      setError({
        message: `Details missing for : ${failingSpareCode}`,
        type: "warning",
        resolution: "Enter Alt. Spare Code and Dispute Remark.",
      });
      setShowToast(true);
      setUpdating(false);
      return;
    }
    try {
      await receiveGRCSpare(payload);
      setError({
        message: "GRC Spare received successfully!",
        type: "success",
        resolution: `Records updated for GRC Number : ${form.grc_number}`,
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to update GRC Spare.",
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
          maxWidth: "100%",
          width: "100%",
          boxSizing: "border-box",
          margin: "0 16px",
          overflowX: "auto",
        }}
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Receive GRC Spare
        </h2>

        <form style={{ marginBottom: 24 }} autoComplete="off">
          {/* GRC Number Row */}
          <div
            className="flex items-center gap-3 justify-center mb-3"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="grc_number"
              className="text-md font-medium text-blue-800"
            >
              GRC Number
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <input
                id="grc_number"
                name="grc_number"
                type="number"
                value={form.grc_number}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, grc_number: e.target.value }));
                  if (grcSuggestions.length > 0) {
                    setShowGrcSuggestions(true);
                  } else {
                    setShowGrcSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (grcSuggestions.length > 0) {
                    setShowGrcSuggestions(true);
                  }
                }}
                onBlur={() =>
                  setTimeout(() => setShowGrcSuggestions(false), 150)
                }
                autoComplete="off"
                className="w-34 text-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-medium"
                style={{ minWidth: 100 }}
              />
              <button
                type="button"
                title="Search GRC Number"
                className="ml-2 p-0 rounded-full bg-gradient-to-tr from-blue-200 to-blue-500 text-white shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-900 focus:outline-none transition-all duration-200 flex items-center justify-center"
                disabled={!form.grc_number || loading}
                tabIndex={0}
                style={{ width: 32, height: 32 }}
                onClick={handleGrcSearch}
              >
                <FiSearch size={20} />
              </button>
              {showGrcSuggestions && (
                <ul
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    zIndex: 10,
                    background: "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    width: 140, // match minWidth of input
                    maxWidth: 140, // allow for some padding if input is wider
                    maxHeight: 180,
                    overflowY: "auto",
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {(form.grc_number.length === 0
                    ? grcSuggestions
                    : grcSuggestions.filter((grc) =>
                        String(grc).includes(form.grc_number),
                      )
                  ).map((grc, idx) => (
                    <li
                      key={grc + idx}
                      style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                      onMouseDown={() => {
                        setForm((prev) => ({ ...prev, grc_number: grc }));
                        setShowGrcSuggestions(false);
                      }}
                    >
                      {grc}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
           <div
            className="flex items-center gap-3 justify-center mb-3"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="division"
              className="text-md font-medium text-blue-800"
            >
              Division
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <input
                id="division"
                name="division"
                type="text"
                value={form.division}
                readOnly
                autoComplete="off"
                className="w-34 text-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-medium cursor-not-allowed"
                style={{ minWidth: 100 }}
              />
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
              <TableRow sx={{ background: "#e3eafc" }}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: 700,
                      fontSize: 17,
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
                      background: idx % 2 === 0 ? "#f4f8ff" : "#fff",
                      height: 40,
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
                        {/* Editable columns */}
                        {[
                          "receive_qty",
                          "defective_qty",
                          "short_qty",
                          "alt_spare_code",
                          "dispute_remark",
                          "alt_spare_qty",
                        ].includes(col.key) ? (
                          col.key === "alt_spare_code" ? (
                            <div style={{ position: "relative", display: "inline-block" }}>
                              <input
                                type="text"
                                value={row[col.key] ?? ""}
                                maxLength={30}
                                style={{
                                  width: 180,
                                  textAlign: "center",
                                  border: "1px solid #d1d5db",
                                  borderRadius: 6,
                                  padding: "4px 6px",
                                  background: "#f8fafc",
                                  fontWeight: 500,
                                }}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setData((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, [col.key]: value } : r,
                                    ),
                                  );
                                }}
                                onFocus={() => setFocusedAltIndex(idx)}
                                onBlur={() => setTimeout(() => setFocusedAltIndex(null), 150)}
                              />
                              {focusedAltIndex === idx && stockList && stockList.length > 0 && (
                                (() => {
                                  const query = String(row.alt_spare_code ?? "").toLowerCase();
                                  const filtered = stockList.filter((s) =>
                                    s.spare_code.toLowerCase().includes(query) ||
                                    (s.spare_description || "").toLowerCase().includes(query),
                                  );
                                  return filtered.length > 0 ? (
                                    <ul
                                      style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        zIndex: 20,
                                        background: "#fff",
                                        border: "1px solid #d1d5db",
                                        borderRadius: 6,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                        width: 180,
                                        maxHeight: 180,
                                        overflowY: "auto",
                                        margin: 0,
                                        padding: 0,
                                        listStyle: "none",
                                      }}
                                    >
                                      {filtered.slice(0, 20).map((spare, sidx) => (
                                        <li
                                          key={spare.spare_code + sidx}
                                          style={{ padding: "6px 10px", cursor: "pointer" }}
                                          onMouseDown={() => {
                                            setData((prev) =>
                                              prev.map((r, i) =>
                                                i === idx
                                                  ? { ...r, alt_spare_code: spare.spare_code }
                                                  : r,
                                              ),
                                            );
                                            setFocusedAltIndex(null);
                                          }}
                                        >
                                          <div style={{ fontSize: 10,fontWeight: 600 }}>{spare.spare_code}</div>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : null;
                                })()
                              )}
                            </div>
                          ) : (
                            <input
                              type={col.key.includes("qty") ? "number" : "text"}
                              value={row[col.key] ?? ""}
                              min={col.key.includes("qty") ? 0 : undefined}
                              maxLength={
                                col.key === "dispute_remark"
                                  ? 40
                                  : undefined
                              }
                              style={{
                                width: col.key.includes("qty") ? 70 : 180,
                                textAlign: "center",
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                padding: "4px 6px",
                                background: "#f8fafc",
                                fontWeight: 500,
                              }}
                              onChange={(e) => {
                                const value = col.key.includes("qty")
                                  ? e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                  : e.target.value;
                                setData((prev) =>
                                  prev.map((r, i) =>
                                    i === idx ? { ...r, [col.key]: value } : r,
                                  ),
                                );
                              }}
                            />
                          )
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
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <button
            type="button"
            onClick={handleReceiveGRC}
            disabled={updating || data.length === 0}
            style={{
              background: "#1976d2",
              color: "#fff",
              fontWeight: 700,
              fontSize: "18px",
              border: "none",
              borderRadius: "6px",
              padding: "4px 24px",
              cursor: updating ? "not-allowed" : "pointer",
              boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
              opacity: updating ? 0.7 : 1,
              transition: "background 0.2s, color 0.2s",
            }}
            aria-label="Receive GRC Spare"
          >
            {updating ? "Receiving..." : "Receive GRC"}
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

export default GRCCGCELReceiveSparePage;
