import React, { useState } from "react";
import { Container, Typography, Paper } from "@mui/material";
import { createEmployee } from "../services/employeeCreateService";
import Toast from "../components/Toast";
import { validateCreateEmployee } from "../utils/employeeCreateValidation";

const roles = ["USER", "ADMIN", "TECHNICIAN"];

const initialForm = {
  name: "",
  dob: "",
  phone_number: "",
  address: "",
  email: "",
  aadhar: "",
  pan: "",
  uan: "",
  pf_number: "",
  joining_date: "",
  role: "TECHNICIAN",
};

const CreateEmployeePage = () => {
  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );
  const maxDateforDOB = eighteenYearsAgo.toLocaleDateString("en-CA");
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "name") {
      newValue = value
        .toLowerCase()
        .replace(/(^|\s)([a-z])/g, (match) => match.toUpperCase());
    }
    setForm({ ...form, [name]: newValue });
  };

  const [errs, errs_label] = validateCreateEmployee(form);

  const handleSubmit = async (e) => {
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
    try {
      // Convert empty string values to null for optional fields
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]),
      );
      await createEmployee(payload);
      setError({
        message: `Employee created successfully!`,
        resolution: "Employee : " + form.name,
        type: "success",
      });
      setShowToast(true);
      setForm(initialForm);
    } catch (err) {
      setError({
        message: err?.message || "Failed to create employee.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Paper
        elevation={4}
        sx={{
          p: 2.5,
          borderRadius: 3,
          background: "#f8fafc",
          maxWidth: 650,
          mx: "auto",
          minHeight: 0,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          mb={3}
          align="center"
          color="primary.dark"
        >
          Create New Employee
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
          {/* Name */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="name"
              className="text-gray-700 text-base font-medium w-22"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className={`flex-1 px-3 py-2 rounded-lg border ${errs_label.name ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
              placeholder="Enter the Full Name"
              maxLength={30}
              minLength={3}
              required
              disabled={submitting}
              autoComplete="name"
            />
          </div>

          {/* DOB and Contact in same line */}
          <div className="flex items-center gap-6 w-full">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="dob"
                className="text-gray-700 text-base font-medium w-22"
              >
                DOB <span className="text-red-500">*</span>
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                className={`flex-1 px-3 py-2 rounded-lg border ${errs_label.dob ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
                required
                disabled={submitting}
                max={maxDateforDOB}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="phone_number"
                className="text-gray-700 text-base font-medium w-28"
              >
                Contact <span className="text-red-500">*</span>
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="text"
                value={form.phone_number}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${errs_label.phone_number ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
                placeholder="Phone Number"
                maxLength={10}
                minLength={10}
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Address as textarea */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="address"
              className="text-gray-700 text-base font-medium w-22"
            >
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              className={`flex-1 px-3 py-2 rounded-lg border ${errs_label.address ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
              placeholder="Address"
              minLength={5}
              maxLength={150}
              required
              disabled={submitting}
              rows={2}
              autoComplete="street-address"
            />
          </div>

          {/* Email */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="email"
              className="text-gray-700 text-base font-medium w-22"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`flex-1 px-3 py-2 rounded-lg border ${errs_label.email ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
              placeholder="Email"
              maxLength={35}
              required
              disabled={submitting}
              autoComplete="email"
            />
          </div>

          {/* Aadhar and PAN in same line */}
          <div className="flex items-center gap-6 w-full">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="aadhar"
                className="text-gray-700 text-base font-medium w-34.5"
              >
                Aadhar
              </label>
              <input
                id="aadhar"
                name="aadhar"
                type="text"
                value={form.aadhar}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${errs_label.aadhar ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
                placeholder="Aadhar Number"
                maxLength={12}
                minLength={12}
                disabled={submitting}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="pan"
                className="text-gray-700 text-base font-medium w-28"
              >
                PAN
              </label>
              <input
                id="pan"
                name="pan"
                type="text"
                value={form.pan}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${errs_label.pan ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
                placeholder="PAN Number"
                maxLength={10}
                minLength={10}
                disabled={submitting}
                pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
              />
            </div>
          </div>

          {/* UAN and PF Number in same line */}
          <div className="flex items-center gap-6 w-full">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="uan"
                className="text-gray-700 text-base font-medium w-34.5"
              >
                UAN
              </label>
              <input
                id="uan"
                name="uan"
                type="text"
                value={form.uan}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${errs_label.uan ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
                placeholder="UAN"
                maxLength={20}
                disabled={submitting}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="pf_number"
                className="text-gray-700 text-base font-medium w-28"
              >
                PF
              </label>
              <input
                id="pf_number"
                name="pf_number"
                type="text"
                value={form.pf_number}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${errs_label.pf_number ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
                placeholder="PF Number"
                maxLength={20}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Joining Date and Role in same line */}
          <div className="flex items-center gap-6 w-full">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="joining_date"
                className="text-gray-700 text-base font-medium w-22"
              >
                DOJ <span className="text-red-500">*</span>
              </label>
              <input
                id="joining_date"
                name="joining_date"
                type="date"
                value={form.joining_date}
                onChange={handleChange}
                className={`flex-1 px-3 py-2 rounded-lg border ${errs_label.joining_date ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
                required
                disabled={submitting}
                max={new Date().toLocaleDateString("en-CA")}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="role"
                className="text-gray-700 text-base font-medium w-28"
              >
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${errs_label.role ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
                required
                disabled={submitting}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center mt-2 mb-1">
            <button
              type="submit"
              className="py-2 px-8 rounded-lg bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-700 transition-colors duration-200 w-fit disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Employee"}
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

export default CreateEmployeePage;
