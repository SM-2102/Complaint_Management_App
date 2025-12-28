import React from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="h-[calc(100vh-7rem)] flex items-center justify-center bg-[#fff]">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg text-center border border-gray-200">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-full inline-flex">
            <FiAlertTriangle className="w-7 h-7" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          The page you are looking for does not exist. <br />
          Please check the URL.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Go back
          </button>
          <button
            onClick={() => navigate("/MenuDashboard")}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
