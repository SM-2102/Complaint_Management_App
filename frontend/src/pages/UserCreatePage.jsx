import React, { useState } from "react";
import { Container, Typography, Paper } from "@mui/material";
import { createUser } from "../services/userCreateService";
import Toast from "../components/Toast";
import { validateCreateUser } from "../utils/userCreateValidation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const roles = ["USER", "ADMIN"];

const initialForm = {
  username: "",
  password: "",
  role: "USER",
  phone_number: "",
};

const CreateUserPage = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "username") {
      if (value.length > 25) return; // Prevent input beyond 25 chars
      // Capitalize first letter of each word, rest lowercase
      newValue = value
        .toLowerCase()
        .replace(/(^|\s)([a-z])/g, (match) => match.toUpperCase());
    }
    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowToast(false);
    const errs = validateCreateUser(form);
    if (errs.length > 0) {
      setError({
        message: errs[0],
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    setSubmitting(true);
    try {
      await createUser(form);
      setError({
        message: `User created successfully!`,
        resolution: "User : " + form.username,
        type: "success",
      });
      setShowToast(true);
      setForm(initialForm);
    } catch (err) {
      setError({
        message: err?.message || "Failed to create user.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={4}
        sx={{
          p: 2.5,
          borderRadius: 3,
          background: "#f8fafc",
          maxWidth: 360,
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
          Create New User
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
          {/* Username */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="username"
              className="text-gray-700 text-base font-medium w-28 text-left"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              placeholder="Username"
              autoComplete="username"
              maxLength={20}
              required
              disabled={submitting}
              inputMode="text"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-2 relative">
            <label
              htmlFor="password"
              className="text-gray-700 text-base font-medium w-28 text-left"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              placeholder="Password"
              autoComplete="new-password"
              minLength={6}
              required
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={submitting}
            >
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Phone Number */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="phone_number"
              className="text-gray-700 text-base font-medium w-28 text-left"
            >
              Contact
            </label>
            <input
              id="phone_number"
              name="phone_number"
              type="text"
              value={form.phone_number}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              placeholder="Phone Number"
              maxLength={10}
              required
              disabled={submitting}
            />
          </div>

          {/* Role */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="role"
              className="text-gray-700 text-base font-medium w-28 text-left"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
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

          <div className="flex justify-center mt-2 mb-1">
            <button
              type="submit"
              className="py-2 px-8 rounded-lg bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-700 transition-colors duration-200 w-fit disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create User"}
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

export default CreateUserPage;
