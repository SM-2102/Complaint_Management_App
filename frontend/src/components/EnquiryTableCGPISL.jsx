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
 */

const EnquiryTableCGPISL = ({
  data = [],
  columns = [],
  title = "Enquiry Table",
  noDataMessage = null,
  sum_column = null,
}) => {
  const tableRef = useRef();

  const handlePrint = () => {
    const printContents = tableRef.current.innerHTML;
    const printWindow = window.open("", "", "height=800,width=1200");
    printWindow.document.write(`<html><head><title>${title}</title>`);
    printWindow.document.write(`<style>
      body{font-family:sans-serif;}
      .print-title{font-size:2rem;font-weight:800;text-align:center;color:#388e3c;margin-bottom:18px;letter-spacing:1px;}
      table{width:100%;border-collapse:collapse;}
      th,td{text-align:center;padding:4px 8px;border:1px solid #ddd;}
      th{background:#e8f5e9;}
      tr:nth-child(even){background:#f1f8e9;}
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
        color="#2e7d32"
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
        <Box display="flex" alignItems="center">
          <button
            onClick={handlePrint}
            style={{
              background: "#388e3c",
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
              color: "#388e3c",
              fontWeight: 700,
              fontSize: 17,
              background: "#cef5d1ff",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
              display: "inline-block",
            }}
          >
            <span style={{ letterSpacing: 0.5 }}>Total Records:</span>{" "}
            <span style={{ color: "#1b5e20", fontWeight: 600 }}>
              {data.length}
            </span>
          </Typography>
        </Box>
      </Box>
      <div ref={tableRef}>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "rgba(207, 245, 210, 1)" }}>
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
                        background: idx % 2 === 0 ? "#ecfadcff" : "#fff",
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

export default EnquiryTableCGPISL;
