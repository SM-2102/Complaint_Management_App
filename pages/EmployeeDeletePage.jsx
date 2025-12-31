import React, { useState, useEffect } from "react";
import { Container, Paper, Typography } from "@mui/material";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { deleteEmployee } from "../services/employeeDeleteService";
import { fetchAllEmployees } from "../services/employeeShowAllService";

const DeleteEmployeePage = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [users, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leavingDate, setLeavingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [error, seterror] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Fetch users function for reuse
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const data = await fetchAllEmployees();
      // Exclude current user
      setEmployees(data.filter((u) => u.name !== user?.name));
    } catch (err) {
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    seterror("");
    setShowToast(false);
    if (!name) {
      seterror({
        message: "No user to delete.",
        resolution: "Please enter a valid name.",
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    setSubmitting(true);
    try {
      await deleteEmployee(name, leavingDate);
      seterror({
        message: "Employee deleted successfully!",
        resolution: `Employee : ${name}`,
        type: "success",
      });
      setShowToast(true);
      setName("");
      setLeavingDate(new Date().toISOString().split("T")[0]);
      fetchEmployees();
    } catch (err) {
      seterror({
        message: err?.message || "Failed to delete user.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 15 }}>
      <Paper
        elevation={4}
        sx={{
          p: 2.5,
          borderRadius: 3,
          background: "#f8fafc",
          maxWidth: 340,
          mx: "auto",
          minHeight: 0,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          mb={2}
          align="center"
          color="primary.dark"
        >
          Delete Employee
        </Typography>
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          noValidate
          className="w-full flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <label
              htmlFor="name"
              className="text-gray-700 text-base font-medium w-28 text-left"
            >
              Username
            </label>
            <select
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              required
              disabled={submitting || loadingEmployees}
              autoComplete="name"
            >
              <option value="" disabled>
                Select a user
              </option>
              {users.map((u) => (
                <option key={u.name} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 ">
            <label
              htmlFor="leavingDate"
              className="text-gray-700 text-base font-medium w-28 text-left"
            >
              Leaving Date
            </label>
            <input
              type="date"
              id="leavingDate"
              name="leavingDate"
              value={leavingDate}
              onChange={(e) => setLeavingDate(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              required
              max={new Date().toLocaleDateString("en-CA")}
            />
          </div>
          <div className="flex justify-center mt-2 mb-1">
            <button
              type="submit"
              className="py-2 px-8 rounded-lg bg-red-600 text-white font-bold text-base shadow hover:bg-red-700 transition-colors duration-200 w-fit disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete Employee"}
            </button>
          </div>
        </form>
      </Paper>
      {showToast && (
        <Toast
          message={error.message}
          resolution={error.resolution}
          type={error.type}
          onClose={() => setShowToast(false)}
        />
      )}
    </Container>
  );
};

export default DeleteEmployeePage;
