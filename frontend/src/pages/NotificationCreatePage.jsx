import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Toast from "../components/Toast";
import { fetchAdminNotifications } from "../services/notificationAdminService";
import { fetchStandardEmployees } from "../services/employeeShowStandardService";
import { createAdminNotification } from "../services/notificationAddService";

const NotificationCreatePage = () => {
  // Table state
  const [notifications, setNotifications] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [tableError, setTableError] = useState(null);

  // Form state
  const [form, setForm] = useState({ details: "", assigned_to: [] });
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoadingTable(true);
    fetchAdminNotifications()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setTableError(null);
      })
      .catch(() => {
        setTableError("Failed to load notifications");
        setNotifications([]);
      })
      .finally(() => setLoadingTable(false));
  }, []);

  // Fetch standard employees (role USER or TECHNICIAN)
  useEffect(() => {
    setLoadingEmployees(true);
    fetchStandardEmployees()
      .then((data) => {
        setEmployees(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setEmployees([]);
      })
      .finally(() => setLoadingEmployees(false));
  }, []);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value, options, type, multiple } = e.target;
    if (name === "assigned_to" && multiple) {
      // Collect all selected options
      const selected = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selected.push(options[i].value);
        }
      }
      setForm((prev) => ({ ...prev, assigned_to: selected }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowToast(false);
    if (!form.details) {
      setError({
        message: "Details are required",
        resolution: "Provide notification details",
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    if (!form.assigned_to || form.assigned_to.length === 0) {
      setError({
        message: "Task is not assigned",
        resolution: "Select one or more assignees",
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Backend expects assigned_to as array
      await createAdminNotification({
        details: form.details,
        assigned_to: form.assigned_to,
      });
      setShowToast(true);
      setError({
        message: "Notification created successfully!",
        type: "success",
      });
      setForm({ details: "", assigned_to: [] });
      // Refresh the page to reload notifications
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      setShowToast(true);
      setError({
        message: err?.message || "Failed to create notification",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      {showToast && error && (
        <Toast
          message={error.message}
          resolution={error.resolution}
          type={error.type}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Notification Create Form */}
      <Paper
        elevation={5}
        sx={{
          p: 3,
          borderRadius: 4,
          background: "#f8fafc",
          maxWidth: "100%",
          overflowX: "auto",
          mb: 3,
        }}
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Create New Task
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "50px 1fr 100px 200px",
            gap: 16,
            alignItems: "start",
          }}
        >
          <label
            htmlFor="details"
            style={{
              fontWeight: 500,
              gridColumn: 1,
              gridRow: 1,
              alignSelf: "center",
            }}
          >
            Details
          </label>
          <textarea
            id="details"
            name="details"
            value={form.details}
            onChange={handleInputChange}
            rows={3}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #abc",
              resize: "vertical",
              fontSize: 16,
              height: 60,
              boxSizing: "border-box",
            }}
            placeholder="Enter notification details"
            disabled={submitting}
            maxLength={150}
            gridColumn={2}
            gridRow={1}
          />
          <label
            htmlFor="assigned_to"
            style={{
              fontWeight: 500,
              gridColumn: 3,
              gridRow: 1,
              alignSelf: "center",
            }}
          >
            Assigned To
          </label>
          <select
            id="assigned_to"
            name="assigned_to"
            multiple
            value={form.assigned_to}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #abc",
              height: 60,
              fontSize: 16,
              boxSizing: "border-box",
              lineHeight: 1.1,
              verticalAlign: "top",
              marginTop: 0,
            }}
            disabled={loadingEmployees || submitting}
            gridColumn={4}
            gridRow={1}
          >
            {employees.map((emp) => {
              const value = emp.username || emp.employee_id || emp.id;
              return (
                <option
                  key={value}
                  value={value}
                  style={{ paddingBottom: 2, height: 22 }}
                >
                  {emp.name || emp.username || emp.employee_id}
                </option>
              );
            })}
          </select>
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 6,
            }}
          >
            <button
              type="submit"
              disabled={submitting || loadingEmployees}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 10px",
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                minWidth: 120,
              }}
            >
              {submitting ? "Adding..." : "Add Notification"}
            </button>
          </div>
        </form>
      </Paper>

      {/* Notifications Table (EnquiryTable style) */}
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
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Pending Tasks
        </h2>
        <div>
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 3, boxShadow: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: "#e3eafc" }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 16,
                      textAlign: "center",
                      py: 1,
                    }}
                  >
                    Details
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 16,
                      textAlign: "center",
                      py: 1,
                    }}
                  >
                    Assigned To
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTable ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : tableError ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      align="center"
                      sx={{ color: "error.main" }}
                    >
                      {tableError}
                    </TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No notifications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((row, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        background: idx % 2 === 0 ? "#f4f8ff" : "#fff",
                        height: 32,
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          textAlign: "center",
                          py: 0.5,
                        }}
                      >
                        {row.details || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          textAlign: "center",
                          py: 0.5,
                        }}
                      >
                        {Array.isArray(row.assigned_to)
                          ? row.assigned_to.join(", ")
                          : row.assigned_to || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Paper>
    </Container>
  );
};

export default NotificationCreatePage;
