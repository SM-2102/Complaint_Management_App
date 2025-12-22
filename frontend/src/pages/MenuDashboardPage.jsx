import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SpinnerLoading from "../components/SpinnerLoading";

const MenuDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);

  return (
    <div className="flex flex-col min-h-[calc(100vh-7rem)] pt-6 px-6 md:px-10 lg:px-20 bg-[#fff]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-grow min-w-0 w-full">
      </div>
    </div>
  );
};

export default MenuDashboardPage;
