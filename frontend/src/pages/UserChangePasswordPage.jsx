import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Container, Paper, Typography } from "@mui/material";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/userChangePasswordService";
import { validateChangePassword } from "../utils/userChangePasswordValidation";

const initialState = {
  old_password: "",
  new_password: "",
  confirm_password: "",
};

const ChangePasswordPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(initialState);

  // Handle input changes (must be inside component to access setForm)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowToast(false);
    const errs = validateChangePassword(form);
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
      await changePassword(user.username, form.old_password, form.new_password);
      setError({
        message: "Password changed successfully!",
        resolution: "Your password has been updated",
        type: "success",
      });
      setForm(initialState);
    } catch (err) {
      setError({
        message: err?.message || "Failed to change password.",
        resolution: err?.resolution || "",
        type: "error",
      });
    } finally {
      setShowToast(true);
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper
        elevation={4}
        sx={{
          p: 2.5,
          borderRadius: 3,
          background: "#f8fafc",
          maxWidth: 430,
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
          Change Password
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Current User : <b>{user?.username}</b>
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
          <div className="flex items-center gap-2 relative">
            <label
              htmlFor="old_password"
              className="text-gray-700 text-base font-medium w-35 text-left"
            >
              Old Password
            </label>
            <input
              id="old_password"
              name="old_password"
              type={showOldPassword ? "text" : "password"}
              value={form.old_password}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium pr-10"
              placeholder="Old Password"
              minLength={6}
              required
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
              onClick={() => setShowOldPassword((v) => !v)}
              tabIndex={-1}
              aria-label={
                showOldPassword ? "Hide old password" : "Show old password"
              }
              disabled={submitting}
            >
              {showOldPassword ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 relative">
            <label
              htmlFor="new_password"
              className="text-gray-700 text-base font-medium w-35 text-left"
            >
              New Password
            </label>
            <input
              id="new_password"
              name="new_password"
              type={showNewPassword ? "text" : "password"}
              value={form.new_password}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium pr-10"
              placeholder="New Password"
              minLength={6}
              required
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
              onClick={() => setShowNewPassword((v) => !v)}
              tabIndex={-1}
              aria-label={
                showNewPassword ? "Hide new password" : "Show new password"
              }
              disabled={submitting}
            >
              {showNewPassword ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 relative">
            <label
              htmlFor="confirm_password"
              className="text-gray-700 text-base font-medium w-35 text-left"
            >
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirm_password}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium pr-10"
              placeholder="Confirm Password"
              minLength={6}
              required
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              disabled={submitting}
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex justify-center mt-2 mb-1">
            <button
              type="submit"
              className="py-2 px-8 rounded-lg bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-700 transition-colors duration-200 w-fit disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Changing..." : "Change Password"}
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

export default ChangePasswordPage;
