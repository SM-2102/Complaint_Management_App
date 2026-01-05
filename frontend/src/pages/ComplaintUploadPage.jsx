import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Button,
  Typography,
  Stack,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ClearIcon from "@mui/icons-material/Clear";
import Toast from "../components/Toast";
import { UploadComplaints } from "../services/complaintUploadService";

const ComplaintUploadPage = () => {
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const isCsvFile = (file) =>
    file &&
    ((file.name || "").toLowerCase().endsWith(".csv") ||
      file.type === "text/csv");

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!isCsvFile(f)) {
      setError({
        message: "Invalid file type",
        resolution: "Only CSV files are allowed",
        type: "warning",
      });
      setShowToast(true);
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const handleClearFile = () => {
    setFile(null);
    const input = document.getElementById("complaint-file-input");
    if (input) input.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await UploadComplaints(file);
      setError({
        message: res.message,
        resolution: res.resolution,
        type: "success",
      });
      handleClearFile();
    } catch (err) {
      setError({
        message: err.message || "Upload failed",
        resolution: err.resolution || "Please try again",
        type: "error",
      });
    } finally {
      setUploading(false);
      setShowToast(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      {showToast && error && (
        <Toast
          message={error.message}
          resolution={error.resolution}
          type={error.type}
          onClose={() => setShowToast(false)}
        />
      )}

      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <h2 className="text-xl font-semibold text-purple-800 mb-4 pb-2 border-b border-purple-500 justify-center flex items-center gap-2">
          Upload Complaint Records
        </h2>

        {/* Upload Box */}
        <Box
          sx={{
            border: "2px dashed",
            borderColor: file ? "#8b5cf6" : "grey.300",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            bgcolor: file ? "primary.50" : "grey.50",
            transition: "all 0.2s ease",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <UploadFileIcon sx={{ fontSize: 40, color: "#7c3aed" }} />

            {!file ? (
              <>
                <Typography variant="body1" fontWeight={500}>
                  Select a CSV file
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Only .csv files are supported
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    color: "#7c3aed",
                    borderColor: "#8b5cf6",
                    "&:hover": {
    backgroundColor: "#8b5cf622",
    borderColor: "#7c3aed",
  },
                  }}
                >
                  Browse File
                  <input
                    id="complaint-file-input"
                    hidden
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                  />
                </Button>
              </>
            ) : (
              <>
                <Chip
                  icon={<InsertDriveFileIcon />}
                  label={file.name}
                  onDelete={handleClearFile}
                  deleteIcon={<ClearIcon />}
                  sx={{ maxWidth: "100%" }}
                />

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleUpload}
                  disabled={uploading}
                  startIcon={
                    uploading ? (
                      <CircularProgress size={18} sx={{ color: "#8b5cf6" }} />
                    ) : (
                      <UploadFileIcon />
                    )
                  }
                  sx={{
  backgroundColor: "#7c3aed",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#6d28d9",
  },
}}
                >
                  {uploading ? "Uploading..." : "Upload File"}
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ComplaintUploadPage;
