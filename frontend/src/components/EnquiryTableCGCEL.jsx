import React, { useRef } from "react";
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

/**
 * EnquiryTable is a reusable component to display enquiry data in a table.
 * @param {Array} data - The list of enquiry objects to display.
 * @param {Array} columns - The list of column definitions: [{ key: string, label: string }].
 * @param {string} [title] - Optional title for the table.
 * @param {integer} total_records - total records count.
 */

import { useState } from "react";

const EnquiryTableCGCEL = ({
  data = [],
  columns = [],
  title = "Enquiry Table",
  noDataMessage = null,
  sum_column = null,
  total_records = 0,
  exportButton = false, // new prop: if true, show export button
}) => {
  const tableRef = useRef();
  const [showExportModal, setShowExportModal] = useState(false);

  const handlePrint = () => {
    const printContents = tableRef.current.innerHTML;
    const printWindow = window.open("", "", "height=800,width=1200");
    printWindow.document.write(`<html><head><title>${title}</title>`);
    printWindow.document.write(`<style>
      body{font-family:sans-serif;}
      .print-title{font-size:2rem;font-weight:800;text-align:center;color:#1976d2;margin-bottom:18px;letter-spacing:1px;}
      table{width:100%;border-collapse:collapse;}
      th,td{text-align:center;padding:4px 8px;border:1px solid #ddd;}
      th{background:#e3eafc;}
      tr:nth-child(even){background:#f4f8ff;}
      tr:nth-child(odd){background:#fff;}
    </style>`);
    printWindow.document.write(`</head><body>`);
    printWindow.document.write(`<div class='print-title'>${title}</div>`);
    printWindow.document.write(printContents);
    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 500);
  };

  // Export modal columns (fixed for this use case)
  const exportColumns = [
    { key: "spare_code", label: "Spare Code" },
    { key: "spare_description", label: "Spare Description" },
    { key: "indent_qty", label: "Quantity" },
  ];

  return (
    <Paper
      elevation={5}
      sx={{
        p: 3,
        borderRadius: 4,
        background: "#f8fafc",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        mb={2}
        align="center"
        color="primary.dark"
        sx={{ mb: 1 }}
      >
        {title}
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        {/* Left: Print and Total Records */}
        <Box display="flex" alignItems="center">
          <button
            onClick={handlePrint}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(25,118,210,0.08)",
              marginRight: "16px",
            }}
          >
            Print
          </button>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#1976d2",
              fontWeight: 700,
              fontSize: 17,
              background: "#e3eafc",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
              display: "inline-block",
            }}
          >
            <span style={{ letterSpacing: 0.5 }}>Total Records:</span>{" "}
            <span style={{ color: "#0d47a1", fontWeight: 600 }}>
              {total_records}
            </span>
          </Typography>
        </Box>
        {/* Right: Export button */}
        {exportButton && (
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(25,118,210,0.08)",
            }}
          >
            Export
          </button>
        )}
      </Box>

      {/* Export Modal */}
      {exportButton && showExportModal && (
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 8,
              }}
            >
              <thead>
                <tr>
                  {exportColumns.map((col) => (
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
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={exportColumns.length}
                      style={{
                        textAlign: "center",
                        padding: 12,
                        color: "#888",
                      }}
                    >
                      No data to export
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => (
                    <tr key={idx}>
                      {exportColumns.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            border: "1px solid #d1d5db",
                            padding: "6px 10px",
                            textAlign: "center",
                            fontSize: 14,
                          }}
                        >
                          {row[col.key] !== null && row[col.key] !== undefined
                            ? row[col.key]
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div ref={tableRef}>
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
              {data.length === 0 && noDataMessage
                ? noDataMessage
                : data.map((row, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        background: idx % 2 === 0 ? "#f4f8ff" : "#fff",
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
                          {typeof col.render === "function"
                            ? col.render(row[col.key], row)
                            : row[col.key] !== null &&
                                row[col.key] !== undefined
                              ? row[col.key]
                              : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Paper>
  );
};

export default EnquiryTableCGCEL;
