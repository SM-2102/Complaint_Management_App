import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Switch,
  Box,
} from "@mui/material";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { fetchAllParameters } from "../services/parameterAllService";
import { updateParameters } from "../services/parameterUpdateService";
import Toast from "../components/Toast";


const COLUMN_WIDTHS = {
  parameter: 200,
  value: 180,
  action: 80,
};

const parameterLabels = {
  rfr_number: "RFR Number",
  financial_year: "Financial Year",
  invoice_no_unique: "Invoice Number (UN)",
  invoice_date_unique: "Invoice Date (UN)",
  invoice_no_smart: "Invoice Number (SE)",
  invoice_date_smart: "Invoice Date (SE)",
  invoicing_permission: "Invoicing Permission",
};

const ParameterModifyPage = () => {
  const [parameters, setParameters] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [originalParameters, setOriginalParameters] = useState([]);
  const [toast, setToast] = useState(null);
const showToast = (message, type = "info", resolution = "") => {
  setToast({ message, type, resolution });
};



useEffect(() => {
  fetchAllParameters()
    .then((data) => {
      // Convert object → array
      const normalized = Object.entries(data).map(([name, value]) => ({
        name,
        value: value ?? "",
      }));

      setParameters(normalized);
      setOriginalParameters(normalized);
    })
    .catch(() => {
      setParameters([]);
      setOriginalParameters([]);
    });
}, []);



  const validate = (name, value) => {
    if (name === "rfr_number") return value.startsWith("RFR");
  if (name === "financial_year") return /^\d{4}$/.test(value);
    if (name.includes("invoice_no")) return /^\d{5}$/.test(value);
    if (name.includes("invoice_date")) return Boolean(value);
    if (name === "invoicing_permission") return value === "Y" || value === "N";
    return true;
  };

  const handleEdit = (p) => {
    setEditingKey(p.name);
    setEditedValue(p.value);
    setError("");
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditedValue("");
    setError("");
  };

  const handleRowSave = (p) => {
    if (!validate(p.name, editedValue)) {
    showToast("Invalid value for " + parameterLabels[p.name], "error");
      return;
    }

    setParameters((prev) =>
      prev.map((x) => (x.name === p.name ? { ...x, value: editedValue } : x))
    );
    handleCancel();
  };

const handleFinalSave = async () => {
  setSubmitting(true);

  try {
    // Convert array → object
    const payload = parameters.reduce((acc, p) => {
      acc[p.name] = p.value;
      return acc;
    }, {});

    await updateParameters(payload);

    setOriginalParameters(parameters);
    showToast("Parameters updated successfully", "success");
  } catch (err) {
    console.error(err);
    showToast(
      err.message || "Failed to update parameters",
      "error",
      err.resolution || ""
    );
  } finally {
    setSubmitting(false);
  }
};




  const renderInput = (p) => {
    if (p.name === "invoicing_permission") {
      return (
        <Switch
          size="small"
          checked={editedValue === "Y"}
          onChange={(e) => setEditedValue(e.target.checked ? "Y" : "N")}
          color="secondary"
        />
      );
    }

    return (
      <TextField
  size="small"
  value={editedValue}
  onChange={(e) => setEditedValue(e.target.value)}
  type={p.name.includes("invoice_date") ? "date" : "text"}
  variant="outlined"
  sx={{
    width: p.name.includes("date") ? 140 : 110,
    "& .MuiInputBase-root": {
      height: 32,
      fontSize: 13,
    },
    "& input": {
      padding: "4px 8px",
    },
  }}
  inputProps={{
    inputMode:
      p.name.includes("invoice_no") || p.name === "financial_year"
        ? "numeric"
        : undefined,
  }}
/>

    );
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 3, mb: 1 }}>
      <Paper sx={{ pt: 3, pl: 3, pr: 3, pb: 2, borderRadius: 4, background: "#faf5ff" }}>
        <Typography
          variant="h6"
          fontWeight={700}
          align="center"
          sx={{ color: "#6b21a8", mb: 2 }}
        >
          Modify Parameters
        </Typography>

        <TableContainer component={Paper}>
          <Table sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow sx={{ background: "#ede9fe" }}>
                <TableCell
  sx={{
    fontWeight: 700,
    fontSize: 17,
    width: COLUMN_WIDTHS.parameter,
  }}
>
  Parameter
</TableCell>

<TableCell
  align="center"
  sx={{
    fontWeight: 700,
    fontSize: 17,
    width: COLUMN_WIDTHS.value,
  }}
>
  Value
</TableCell>

<TableCell
  align="center"
  sx={{
    fontWeight: 700,
    fontSize: 17,
    width: COLUMN_WIDTHS.action,
  }}
>
  Action
</TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {parameters.map((p, idx) => (
                <TableRow
                  key={p.name}
                  sx={{ background: idx % 2 === 0 ? "#f5f3ff" : "#fff" }}
                >
                  <TableCell
  sx={{
    fontSize: 14,
    fontWeight: 600,
    width: COLUMN_WIDTHS.parameter,
    whiteSpace: "nowrap",
  }}
>
  {parameterLabels[p.name]}
</TableCell>

<TableCell
  align="center"
  sx={{
    fontSize: 14,
    width: COLUMN_WIDTHS.value,
  }}
>

                    {editingKey === p.name ? (
                      <>
                        {renderInput(p)}
                      </>
                    ) : p.name === "invoicing_permission" ? (
                      p.value === "Y" ? "Yes" : "No"
                    ) : (
                      p.value
                    )}
                  </TableCell>

<TableCell
  align="center"
  sx={{
    width: COLUMN_WIDTHS.action,
  }}
>                    <Box display="flex" justifyContent="center" gap={2}>
                      {editingKey === p.name ? (
                        <>
                          <FaSave
                            onClick={() => handleRowSave(p)}
                            style={{ cursor: "pointer", color: "#6b21a8" }}
                          />
                          <FaTimes
                            onClick={handleCancel}
                            style={{ cursor: "pointer", color: "#6b7280" }}
                          />
                        </>
                      ) : (
                        <FaEdit
                          onClick={() => handleEdit(p)}
                          style={{ cursor: "pointer", color: "#6b21a8" }}
                        />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="flex justify-center mt-6">
          <button
            className="py-1.5 px-6 rounded-lg bg-purple-600 text-white font-bold text-base shadow hover:bg-purple-900 transition-colors duration-200 disabled:opacity-60"
            disabled={submitting}
            onClick={handleFinalSave}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </Paper>
      {toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    resolution={toast.resolution}
    onClose={() => setToast(null)}
  />
)}
    </Container>
  );
};

export default ParameterModifyPage;
