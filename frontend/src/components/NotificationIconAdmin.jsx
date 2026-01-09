import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { fetchAdminCountNotifications } from "../services/notificationAdminCountService";

const NotificationIconAdmin = () => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await fetchAdminCountNotifications();
        setNotificationCount(data?.count ?? 0);
      } catch (error) {
        setNotificationCount(0);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="relative inline-flex items-center align-middle mr-4">
      <button
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-900 hover:bg-blue-700 border-none outline-none cursor-pointer p-0"
        onClick={() => navigate("/CreateNotification")}
        aria-label="Show notifications"
        type="button"
      >
        <FaBell className="w-5 h-5 text-white" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-red-600 to-pink-500 text-white shadow-md rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[20px] text-center">
            {notificationCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationIconAdmin;
