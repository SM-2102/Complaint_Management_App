import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const DashboardButton = ({ className = "", ...props }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/MenuDashboard")}
      className={
        "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-900 hover:bg-blue-600 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 hover:scale-105 transform " +
        className
      }
      title="Go to Dashboard"
      {...props}
    >
      <FaHome className="w-5 h-5" />
    </button>
  );
};

export default DashboardButton;
