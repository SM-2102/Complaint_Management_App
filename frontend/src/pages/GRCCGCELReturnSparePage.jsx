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
import { updateCGCELReturnSave } from "../services/grcCGCELReturnSaveService";
import { fetchNextCGCELGRCChallanCode } from "../services/grcCGCELNextChallanCodeService";
import { grcCGCELListByDivision } from "../services/grcCGCELReturnListByDivisionService";
import { printGRCReturn } from "../services/grcCGCELReturnPrintService";
import { updateCGCELReturnFinalize } from "../services/grcCGCELReturnFinalizeService";
import { validateReturn } from "../utils/grcReturnValidation";
import { validateReturnQuantities } from "../utils/grcQuantityValidation";

const columns = [
  { key: "grc_number", label: "GRC Number" },
  { key: "grc_date", label: "GRC Date" },
  { key: "spare_code", label: "Spare Code" },
  { key: "spare_description", label: "Spare Description" },
  { key: "issue_qty", label: "Issue Qty" },
  { key: "grc_pending_qty", label: "GRC Pending Qty" },
  { key: "actual_pending_qty", label: "Actual Pending Qty" },
  { key: "returned_qty", label: "Returned Qty" },
  { key: "good_qty", label: "Good Qty" },
  { key: "defective_qty", label: "Defective Qty" },
  { key: "invoice", label: "Invoice" },
];

const divisionOptions = ["FANS", "PUMP", "LIGHT", "SDA", "WHC", "LAPP"];
const QtyInput = React.memo(function QtyInput({
  value,
  disabled,
  onCommit,
  hasError,
}) {
  const [local, setLocal] = useState(value ?? "");
  useEffect(() => {
    // Only update local if value changed from parent (not while editing)
    if (String(value ?? "") !== String(local)) {
      setLocal(value ?? "");
    }
    // eslint-disable-next-line
  }, [value]);

  const handleBlur = () => {
    if (String(local) !== String(value ?? "")) {
      onCommit(local === "" ? "" : Number(local));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  return (
    <input
      type="number"
      value={local}
      disabled={disabled}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        width: 70,
        textAlign: "center",
        border: hasError ? "1px solid #fca5a5" : "1px solid #7c9ccbff",
        borderRadius: 6,
        padding: "4px 6px",
        background: disabled ? "#e5e7eb" : "#f8fafc",
        fontWeight: 500,
        color: disabled ? "#9ca3af" : undefined,
        cursor: disabled ? "not-allowed" : undefined,
      }}
    />
  );
});

const Row = React.memo(function Row({
  row,
  rowIndex,
  columns,
  onToggleInvoice,
  onCommitQty,
  qtyErrors,
}) {
  const hasQtyError = !!(qtyErrors && qtyErrors[rowIndex]);
  return (
    <TableRow
      key={`${row.spare_code}-${row.grc_number}`}
      sx={{
        background: rowIndex % 2 === 0 ? "#f4f8ff" : "#fff",
        height: 38,
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
          {col.key === "invoice" ? (
            <button
              type="button"
              style={{
                borderRadius: "6px",
                border: "none",
                background: row.invoice === "Y" ? "#e3fcec" : "#ffe3e3",
                color: row.invoice === "Y" ? "#388e3c" : "#d32f2f",
                fontWeight: 700,
                fontSize: "15px",
                padding: "4px 12px",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
                transition: "background 0.2s, color 0.2s",
                width: 60,
              }}
              aria-label="Toggle Invoice"
              onClick={() => onToggleInvoice(rowIndex)}
            >
              {row.invoice === "Y" ? "Yes" : "No"}
            </button>
          ) : ["good_qty", "defective_qty"].includes(col.key) ? (
            <QtyInput
              value={row[col.key]}
              disabled={row.invoice === "Y"}
              onCommit={(val) => onCommitQty(rowIndex, col.key, val)}
              hasError={hasQtyError}
            />
          ) : row[col.key] !== null && row[col.key] !== undefined ? (
            row[col.key]
          ) : (
            "-"
          )}
        </TableCell>
      ))}
    </TableRow>
  );
});

const reportTypeOptions = ["All", "Good", "Defective", "Blank"];
const actionTypeOptions = ["Save as Draft", "Report", "Finalize"];

const initialForm = {
  division: "",
  challan_number: "",
  report_type: "All",
  action_type: "Save as Draft",
  sent_through: "",
  docket_number: "",
};

// Suggestions for Received By

const GRCCGCELReturnSparePage = () => {
  const [data, setData] = useState([]);
  // Handler for GRC Number search
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const tableRef = useRef();
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [qtyErrors, setQtyErrors] = useState({});
  // Track if report_type should be enabled
  const isReportTypeEnabled = form.action_type === "Report";

  const [errs, errs_label] = validateReturn(form);

  const handleToggleInvoice = React.useCallback((index) => {
    setData((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const newInvoice = r.invoice === "Y" ? "N" : "Y";
        if (newInvoice === "Y") {
          return {
            ...r,
            invoice: newInvoice,
            good_qty: null,
            defective_qty: null,
          };
        }
        return { ...r, invoice: newInvoice };
      }),
    );
    // Clear any qty error on toggling invoice
    setQtyErrors((errs) => {
      const next = { ...errs };
      delete next[index];
      return next;
    });
  }, []);

  const handleCommitQty = React.useCallback((index, field, val) => {
    setData((prev) => {
      if (prev[index][field] === val) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      // Live-check for quantity mismatch on this row
      const good = Number(updated[index].good_qty) || 0;
      const defective = Number(updated[index].defective_qty) || 0;
      const pending = Number(updated[index].actual_pending_qty) || 0;
      const isError = good + defective > pending;
      setQtyErrors((errs) => {
        const next = { ...errs };
        if (isError) next[index] = true;
        else delete next[index];
        return next;
      });
      return updated;
    });
  }, []);

  // Handle Execute Action button click
  const handleExecuteAction = async (e) => {
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
    setQtyErrors({});
    const { valid, message, failingIndices } = validateReturnQuantities(data);
    if (!valid) {
      setError({ message, type: "warning" });
      setShowToast(true);
      // Highlight all failing rows
      const errMap = (failingIndices || []).reduce((acc, i) => {
        acc[i] = true;
        return acc;
      }, {});
      setQtyErrors(errMap);
      return;
    }

    setUpdating(true);
    setError("");
    try {
      if (form.action_type === "Save as Draft") {
        // Save as Draft logic
        const payload = data.map((row) => ({
          spare_code: row.spare_code || "",
          grc_number: row.grc_number || 0,
          good_qty: row.good_qty || 0,
          defective_qty: row.defective_qty || 0,
          invoice: row.invoice || "",
          docket_number: form.docket_number || "",
          sent_through: form.sent_through || "",
        }));
        await updateCGCELReturnSave(payload);
        setShowToast(true);
        setError({ message: "Saved as draft successfully!", type: "success" });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (form.action_type === "Report") {
        // Report logic: call print API with correct route and payload
        const reportType = form.report_type || "All";
        const payload = {
          challan_number: form.challan_number,
          division: form.division,
          sent_through: form.sent_through,
          docket_number: form.docket_number,
          grc_rows: data
            .filter((row) => row.invoice !== "Y")
            .filter((row) => {
              const good = Number(row.good_qty) || 0;
              const defective = Number(row.defective_qty) || 0;

              if (reportType === "Blank") {
                return true;
              }

              if (reportType === "All") {
                return good + defective > 0;
              }

              if (reportType === "Good") {
                return good > 0;
              }

              // Defective
              return defective > 0;
            })
            .map((row) => ({
              grc_number: row.grc_number,
              grc_date: row.grc_date,
              spare_code: row.spare_code || "",
              spare_description: row.spare_description || "",
              actual_pending_qty: row.actual_pending_qty,
              good_qty: row.good_qty,
              defective_qty: row.defective_qty,
            })),
        };
        // Call the print API (opens PDF in new tab, handled in service)
        await printGRCReturn({ ...payload, report_type: reportType });
        setShowToast(true);
        setError({
          message: "Report generated successfully!",
          type: "success",
        });
      } else if (form.action_type === "Finalize") {
        // Finalize logic with correct payload structure
        if (data.length === 0) {
          return;
        }
        const payload = {
          challan_number: form.challan_number || "",
          division: form.division || "",
          sent_through: form.sent_through || "",
          docket_number: form.docket_number || "",
          grc_rows: data.map((row) => ({
            spare_code: row.spare_code || "",
            grc_number: row.grc_number || 0,
            good_qty: row.good_qty || 0,
            defective_qty: row.defective_qty || 0,
          })),
        };
        await updateCGCELReturnFinalize(payload);
        setShowToast(true);
        setError({ message: "Finalized successfully!", type: "success" });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setError({
        message: err.message || "Failed to execute action.",
        type: "error",
        resolution: err.resolution || "Please try again.",
      });
      setShowToast(true);
    } finally {
      setUpdating(false);
    }
  };

  // When action_type changes, clear report_type if not 'Report'
  useEffect(() => {
    if (!isReportTypeEnabled && form.report_type !== "") {
      setForm((prev) => ({ ...prev, report_type: "" }));
    }
    if (isReportTypeEnabled && form.report_type === "") {
      setForm((prev) => ({ ...prev, report_type: "All" }));
    }
  }, [form.action_type]);

  useEffect(() => {
    let mounted = true;
    fetchNextCGCELGRCChallanCode()
      .then((data) => {
        if (mounted && data) {
          setForm((prev) => ({
            ...prev,
            challan_number: data.next_cgcel_challan_code || "",
          }));
        }
      })
      .catch(() => {
        setForm((prev) => ({ ...prev, challan_number: "" }));
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
    grcCGCELListByDivision(form.division)
      .then((result) => {
        if (mounted) {
          // Normalize invoice value to 'N' if not 'Y' or 'N'
          const normalized = Array.isArray(result)
            ? result.map((row) => ({
                ...row,
                invoice:
                  row.invoice && ["Y", "N"].includes(row.invoice.trim())
                    ? row.invoice.trim()
                    : "N",
              }))
            : [];
          setData(normalized);
          setQtyErrors({});
          if (normalized.length > 0) {
            setForm((prev) => ({
              ...prev,
              sent_through: normalized[0].sent_through || "",
              docket_number: normalized[0].docket_number || "",
            }));
          } else {
            setForm((prev) => ({
              ...prev,
              sent_through: "",
              docket_number: "",
            }));
          }
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
        setForm((prev) => ({
          ...prev,
          sent_through: "",
          docket_number: "",
        }));
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [form.division]);

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
          Return GRC Spare
        </h2>

        <form style={{ marginBottom: 24 }} autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-1 ml-10 mr-10">
            {/* Division */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="division"
                className="text-md font-medium text-gray-700 min-w-[110px]"
              >
                Division<span className="text-red-500">*</span>
              </label>
              <select
                id="division"
                name="division"
                value={form.division}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, division: e.target.value }))
                }
                required
                className="w-full mr-40 px-2 py-1 rounded-lg border border-gray-300 text-gray-900 font-small focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ minWidth: 140 }}
              >
                <option value="" disabled>
                  Select Division
                </option>
                {divisionOptions.map((opt, idx) => (
                  <option key={opt + idx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            {/* Challan Number */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="challan_number"
                className="text-md  ml-20 font-medium text-blue-800 min-w-[110px]"
              >
                Challan Code
              </label>
              <input
                id="challan_number"
                name="challan_number"
                type="text"
                value={form.challan_number}
                readOnly
                disabled
                autoComplete="off"
                className="w-full text-center px-2 mr-20 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-medium cursor-not-allowed"
                style={{ minWidth: 120 }}
              />
            </div>
            {/* Returned Through */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="sent_through"
                className="text-md ml-20 font-medium text-gray-700 min-w-[140px]"
              >
                Returned Through
              </label>
              <input
                id="sent_through"
                name="sent_through"
                type="text"
                value={form.sent_through}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sent_through: e.target.value }))
                }
                className={`w-full px-2 py-1 rounded-lg border ${errs_label.sent_through ? "border-red-300" : "border-gray-300"} font-small focus:outline-none focus:ring-2 focus:ring-blue-400 `}
                style={{ minWidth: 140 }}
                autoComplete="off"
                maxLength={20}
              />
            </div>
            {/* Report Type */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="report_type"
                className="text-md font-medium text-gray-700 min-w-[110px]"
              >
                Report Type
              </label>
              <select
                id="report_type"
                name="report_type"
                value={isReportTypeEnabled ? form.report_type : ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, report_type: e.target.value }))
                }
                className={`w-full mr-40 px-2 py-1 rounded-lg border border-gray-300 font-small focus:outline-none focus:ring-2 focus:ring-blue-400 ${!isReportTypeEnabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "text-gray-900"}`}
                style={{ minWidth: 140 }}
                disabled={!isReportTypeEnabled}
              >
                {!isReportTypeEnabled ? (
                  <option value=""></option>
                ) : (
                  reportTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))
                )}
              </select>
            </div>
            {/* Action Type */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="action_type"
                className="text-md font-medium ml-20 text-gray-700 min-w-[110px]"
              >
                Action Type
              </label>
              <select
                id="action_type"
                name="action_type"
                value={form.action_type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, action_type: e.target.value }))
                }
                className="w-full px-2 py-1 mr-20 rounded-lg border border-gray-300 text-gray-900 font-small focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ minWidth: 140 }}
              >
                {actionTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            {/* Consignment Note No. */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="docket_number"
                className="text-md font-medium ml-20 text-gray-700 min-w-[140px]"
              >
                Consignment No.
              </label>
              <input
                id="docket_number"
                name="docket_number"
                type="text"
                value={form.docket_number}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    docket_number: e.target.value,
                  }))
                }
                className={`w-full px-2 py-1 rounded-lg border ${errs_label.docket_number ? "border-red-300" : "border-gray-300"} font-small focus:outline-none focus:ring-2 focus:ring-blue-400 `}
                style={{ minWidth: 140 }}
                autoComplete="off"
                maxLength={8}
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
                  <Row
                    key={`${row.spare_code}-${row.grc_number}`}
                    row={row}
                    rowIndex={idx}
                    columns={columns}
                    onToggleInvoice={handleToggleInvoice}
                    onCommitQty={handleCommitQty}
                    qtyErrors={qtyErrors}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* </div> */}
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <button
            type="button"
            onClick={handleExecuteAction}
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
            aria-label="Execute"
          >
            {updating ? "Executing..." : "Execute Action"}
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

export default GRCCGCELReturnSparePage;
