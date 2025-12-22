import React, { useState } from "react";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { useDashboardDataContext } from "../context/DashboardDataContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { login } from "../services/loginService";
import loginImage from "../assets/login_image.png";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const { fetchDashboardData } = useDashboardDataContext();

  // Handle login form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      // Ensure auth state is updated before navigating
      await checkAuth();
      // Fetch dashboard data before navigating
      await fetchDashboardData();
      navigate("/MenuDashboard");
    } else {
      setError({
        message: result.message || "Login failed",
        resolution: result.resolution || "",
      });
      setShowToast(true);
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message={error.message}
          resolution={error.resolution}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="h-[calc(100vh-7rem)] relative flex items-center justify-center">
        {/* Background Image as IMG (prevents cropping) */}
        <img
          src={loginImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-contain object-left"
        />

        {/* Subtle dark overlay (optional, improves readability) */}
        <div className="absolute inset-0"></div>

        <div
          className="relative z-10 w-full max-w-sm bg-[#f9fcff] border border-blue-800 rounded-xl shadow-lg p-6 flex flex-col"
          style={{ marginLeft: "60%" }}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-wide text-center">
            Smart Enteprise Management App
          </h2>
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-2">
              <label
                className="text-gray-700 text-base font-medium w-28 text-left"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value.length > 25) return;
                  // Capitalize first letter of each word
                  value = value
                    .toLowerCase()
                    .replace(/(^|\s)([a-z])/g, (match) => match.toUpperCase());
                  setUsername(value);
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium pr-10"
                placeholder="Username"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-2 relative">
              <label
                className="text-gray-700 text-base font-medium w-28 text-left"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium pr-10"
                placeholder="Password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="py-2 px-8 rounded-lg bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-700 transition-colors duration-200 mt-2 mb-2 w-fit disabled:opacity-60"
                disabled={loading}
              >
                {loading ? `Please Wait...` : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
