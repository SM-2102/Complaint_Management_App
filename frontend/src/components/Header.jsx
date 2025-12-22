import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import NavBar from "./NavBar";
import logo from "../assets/logo.png";
import UserMenu from "./UserMenu";
import Logout from "./Logout";
import DashboardButton from "./Dashboard";
import GoBackIcon from "./GoBackIcon";
import { useDashboardData } from "../hooks/useDashboardData";
import { FiRefreshCw } from "react-icons/fi";

const Header = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const isMenuPage = location.pathname === "/MenuDashboard";
  const [navOpen, setNavOpen] = React.useState(false);
  const { refetch, loading } = useDashboardData();

  const navigate = useNavigate();

  // Only show NavBar icon on allowed pages
  const showNavIcon = !isLoginPage;
  // Show GoBackIcon on all pages except login and menu
  const showGoBackIcon = !isLoginPage && !isMenuPage;

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex flex-col sm:flex-row items-center sm:justify-between bg-blue-900 p-2 sm:p-3 sm:px-8 shadow h-auto sm:h-22">
      <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto">
        <div
          className="relative flex items-center"
          style={{ minWidth: 170, minHeight: 48 }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            {showNavIcon && (
              <div className="flex items-center space-x-2">
                <button
                  className="w-10 h-10 rounded-full bg-blue-900 hover:bg-blue-700 text-white transition-colors duration-200 focus:outline-none flex items-center justify-center"
                  onClick={() => setNavOpen(true)}
                  title="Open Navigation Menu"
                >
                  <FaBars className="text-2xl" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-18 h-18 ml-20">
            <img
              src={logo}
              alt="Logo"
              className="h-16 w-16 sm:h-16 sm:w-16 sm:mb-0"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left w-full">
          <span
            className="text-white text-2xl sm:text-4xl font-semibold tracking-wide leading-tight mt-1"
            style={{ fontFamily: "Times New Roman, Times, serif" }}
          >
            Unique Services
          </span>
          <span
            className="text-blue-50 text-sm sm:text-lg font-medium mb-1"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            12, Sakharitola Street, Kolkata - 700014
          </span>
        </div>
      </div>
      {!isLoginPage && (
        <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0 mr-0 sm:mr-14">
          {/* Reserved space for GoBack button */}
          <div className="flex items-center gap-3 mt-2 sm:mt-0 mr-0 sm:mr-4">
            {showGoBackIcon && <GoBackIcon onClick={() => navigate(-1)} />}

            {isMenuPage && (
              <button
                onClick={refetch}
                disabled={loading}
                aria-label="Refresh Dashboard"
                title="Refresh Dashboard"
                className="w-10 h-10 text-white
               disabled:opacity-60 disabled:cursor-not-allowed
               flex items-center justify-center hover:bg-blue-700 rounded-full"
              >
                <FiRefreshCw
                  size={20}
                  strokeWidth={3}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            )}
          </div>

          <DashboardButton />
          <UserMenu />
          <Logout />
        </div>
      )}
      {showNavIcon && <NavBar open={navOpen} setOpen={setNavOpen} />}
    </header>
  );
};

export default Header;
