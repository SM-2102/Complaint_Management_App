import React from "react";
import { FaPowerOff } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/logoutService";
import { useAuth } from "../context/AuthContext";

const Logout = ({ className = "", ...props }) => {
  const navigate = useNavigate();
  const { handleUnauthorized } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      try {
        handleUnauthorized();
      } catch (e) {
        console.warn("handleUnauthorized not available", e);
      }
      navigate("/");
    } else {
      console.error("Logout failed:", result.message);
      try {
        handleUnauthorized();
      } catch {}
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={
        "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-900 hover:bg-red-500 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:scale-105 transform " +
        className
      }
      title="Logout"
      {...props}
    >
      <FaPowerOff className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  );
};

export default Logout;
