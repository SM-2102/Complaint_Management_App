import React, { useState, useRef, useEffect } from "react";
import {
  FaUser,
  FaKey,
  FaUserPlus,
  FaUserMinus,
  FaUsers,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "../services/authFetchService";
import SpinnerLoading from "./SpinnerLoading";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Real user data from API
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      setUserError(null);
      try {
        const res = await authFetch(API_ENDPOINTS.AUTH_ME, {}, () => {
          setUser(null);
          setUserError("Session expired. Please log in again.");
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data);
        } else {
          setUser(null);
          setUserError("Unable to fetch user info");
        }
      } catch (err) {
        setUser(null);
        setUserError("Unable to fetch user info");
      }
      setUserLoading(false);
    };
    if (isOpen) fetchUser();
  }, [isOpen]);

  const roleLabels = {
    ADMIN: "Administrator",
    USER: "Standard User",
  };

  const handleChangePassword = () => {
    navigate("/ChangePassword");
  };

  const handleCreateUser = () => {
    navigate("/CreateUser");
  };

  const handleDeleteUser = () => {
    navigate("/DeleteUser");
  };

  const handleShowUsers = () => {
    navigate("/ShowAllUsers");
  };

  const handleShowStandardUsers = () => {
    navigate("/ShowStandardUsers");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FaUser className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
          <div className="px-4 py-3 border-b border-gray-100">
            {userLoading ? (
              <SpinnerLoading text="Loading User Data" />
            ) : userError ? (
              <p className="text-m text-red-500">{userError}</p>
            ) : user ? (
              <>
                <p className="text-xl font-medium text-gray-900">
                  {user.username}
                </p>
                <p className="text-s text-gray-500">
                  {roleLabels[user.role] || user.role}
                </p>
                <p className="text-s text-gray-600">
                  Contact : {user.phone_number}
                </p>
              </>
            ) : null}
          </div>

          {user && user.role === "ADMIN" && (
            <>
              <button
                onClick={handleCreateUser}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FaUserPlus className="mr-3 h-4 w-4 text-blue-500" />
                Create User
              </button>

              <button
                onClick={handleDeleteUser}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FaUserMinus className="mr-3 h-4 w-4 text-orange-500" />
                Delete User
              </button>

              <button
                onClick={handleShowUsers}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FaUsers className="mr-3 h-4 w-4 text-green-500" />
                Show All Users
              </button>

              <div className="border-t border-gray-100 my-1"></div>
            </>
          )}

          {user && user.role === "USER" && (
            <>
              <button
                onClick={handleShowStandardUsers}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FaUsers className="mr-3 h-4 w-4 text-green-500" />
                Show Users
              </button>
            </>
          )}

          <button
            onClick={handleChangePassword}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FaKey className="mr-3 h-4 w-4 text-gray-400" />
            Change Password
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
