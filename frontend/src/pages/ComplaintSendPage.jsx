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
import { fetchMailTechnician } from "../services/complaintMailTechnicianService";
import { Checkbox } from "@mui/material";
import { complaintSendEmail } from "../services/complaintMailSendService";

const columns = [
  { key: "select", label: "Send" },
  { key: "name", label: "Technician Name" },
  { key: "email", label: "Email ID" },
];

const ComplaintSendPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [updating, setUpdating] = useState(false);
  const allSelected = data.length > 0 && data.every((r) => r.select === "Y");
  const someSelected = data.some((r) => r.select === "Y");
  const handleSelectAll = (checked) => {
    setData((prev) =>
      prev.map((row) => ({ ...row, select: checked ? "Y" : "N" })),
    );
  };

  /* ---------- Fetch technicians on load (NO UI CHANGE) ---------- */
  useEffect(() => {
    let mounted = true;

    fetchMailTechnician()
      .then((result) => {
        if (mounted) {
          const rows = Array.isArray(result)
            ? result.map((r) => ({ ...r, select: "N" }))
            : [];
          setData(rows);
        }
      })
      .catch((err) => {
        setError({
          message: err?.message || "Failed to fetch records.",
          type: "error",
          resolution: "Please try again later.",
        });
        setShowToast(true);
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- Toggle selection (reuses existing Yes/No button UI) ---------- */
  const handleSelect = (idx) => {
    setData((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, select: row.select === "Y" ? "N" : "Y" } : row,
      ),
    );
  };

  /* ---------- Final action button ---------- */
  const handleSendMail = async () => {
    const selectedRows = data.filter((row) => row.select === "Y");

    if (selectedRows.length === 0) {
      setError({
        message: "No technicians selected.",
        type: "warning",
        resolution: "Please select at least one record.",
      });
      setShowToast(true);
      return;
    }

    setUpdating(true);

    try {
      const payload = selectedRows.map(({ name, email }) => ({
        name,
        email,
      }));

      await complaintSendEmail(payload);

      setError({
        message: "Mail sent successfully!",
        type: "success",
        resolution: `Recipients: ${payload.length}`,
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Operation failed.",
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
          maxWidth: 600,
          width: "100%",
          boxSizing: "border-box",
          margin: "0 16px",
          overflowX: "auto",
        }}
      >
        <h2 className="text-xl font-semibold text-purple-800 mb-5 pb-2 border-b border-purple-500 justify-center flex items-center gap-2">
          Complaint Mail Generation
        </h2>

        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "#f3e5f5" }}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: 700,
                      fontSize: 16,
                      textAlign: col.key === "select" ? "left" : "center",
                      py: 1,
                      pl: col.key === "select" ? 2 : 0,
                    }}
                  >
                    {col.key === "select" ? (
                      <Checkbox
                        checked={allSelected}
                        indeterminate={!allSelected && someSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          padding: 0,
                          "&.Mui-checked": { color: "#7b1fa2" },
                          "&.MuiCheckbox-indeterminate": { color: "#7b1fa2" },
                        }}
                      />
                    ) : (
                      col.label
                    )}
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
                    Loading ...
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      background: idx % 2 === 0 ? "#f6f2ff" : "#fff",
                      height: 32,
                    }}
                  >
                    <TableCell sx={{ textAlign: "left", pl: 2 }}>
                      <Checkbox
                        checked={row.select === "Y"}
                        onChange={() => handleSelect(idx)}
                        sx={{
                          padding: 0,
                          "&.Mui-checked": { color: "#7b1fa2" },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {row.name}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {row.email}
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
              color: "#7b1fa2",
              fontWeight: 700,
              fontSize: 17,
              background: "#f3e5f5",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
            }}
          >
            Selected Records:{" "}
            <span style={{ color: "#4a148c" }}>
              {data.filter((r) => r.select === "Y").length}
            </span>
          </Typography>

          <button
            type="button"
            onClick={handleSendMail}
            disabled={updating || data.length === 0}
            style={{
              background: "#7b1fa2",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              border: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              cursor: updating ? "not-allowed" : "pointer",
              boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
              opacity: updating ? 0.7 : 1,
            }}
          >
            {updating ? "Sending..." : "Send Mail"}
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

export default ComplaintSendPage;
