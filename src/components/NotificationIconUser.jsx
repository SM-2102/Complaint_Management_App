import React, { useEffect, useState, useRef } from "react";
import { fetchUserNotifications } from "../services/notificationUserService.js";
import { resolveNotification } from "../services/notificationResolveService.js";
import { FaBell } from "react-icons/fa";

const NotificationIconUser = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [swipedId, setSwipedId] = useState(null);
  const [resolving, setResolving] = useState(false);
  const ref = useRef();
  console.log("[NotificationIconUser] Mounted");

  useEffect(() => {
    fetchUserNotifications()
      .then((data) => {
        setNotifications(data || []);
      })
      .catch((err) => {
        setNotifications([]);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-flex items-center align-middle" ref={ref}>
      <button
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-900 hover:bg-blue-700 border-none outline-none cursor-pointer p-0"
        onClick={() => setOpen((o) => !o)}
        aria-label="Show notifications"
        type="button"
      >
        <FaBell className="w-5 h-5 text-white" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-red-600 to-pink-500 text-white shadow-md rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[20px] text-center">
            {notifications.length}
          </span>
        )}
      </button>
      {open &&
        (notifications.length === 0 ? (
          <div
            className="fixed right-50 top-16 w-60 shadow-2xl px-0.5 rounded-lg animate-fade-in flex flex-col items-center justify-center select-none z-50"
            style={{
              background: "rgba(106, 148, 238, 0.25)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              border: "1px solid black",
            }}
          >
            <li className="flex flex-col items-center justify-center py-6 text-center w-full">
              <span className="mb-2">
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#2c5596ff"
                  className="mx-auto"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <path
                    d="M8 12h8M12 8v8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="text-base font-semibold text-blue-900">
                No notifications
              </span>
              <span className="text-xs text-gray-700 mt-1">
                You're all caught up!
              </span>
            </li>
          </div>
        ) : (
          <div
            className="fixed top-16 right-50 w-60 shadow-2xl z-50 animate-fade-in flex flex-col"
            style={{
              background: "rgba(37, 99, 235, 0.25)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              border: "1px solid black",
              maxHeight: notifications.length > 2 ? "10rem" : "none",
              height: notifications.length === 1 ? "auto" : undefined,
              overflowY: notifications.length > 2 ? "auto" : "visible",
            }}
          >
            {notifications.map((n, idx) => (
              <div
                key={n.id}
                className="flex items-start gap-3 px-3 py-1 bg-white/80 hover:bg-blue-50 transition-colors duration-150 relative"
                style={{
                  borderBottom:
                    idx !== notifications.length - 1 ? "none" : "none",
                  cursor: "pointer",
                }}
                onClick={() => setSwipedId(swipedId === n.id ? null : n.id)}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center mt-0.2 shadow-sm">
                  <FaBell className="text-blue-500 text-lg" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-800 text-sm font-medium leading-snug">
                    {n.details}
                  </div>
                </div>
                {/* Swipe animation and Resolved button */}
                {swipedId === n.id && (
                  <div
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center animate-fade-in"
                    style={{ zIndex: 20 }}
                  >
                    <button
                      className={`bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow font-semibold text-sm ${resolving ? "opacity-60 cursor-not-allowed" : ""}`}
                      disabled={resolving}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setResolving(true);
                        try {
                          await resolveNotification(n.id);
                          setNotifications((prev) =>
                            prev.filter((x) => x.id !== n.id),
                          );
                          setSwipedId(null);
                        } catch (err) {
                          // Optionally show error
                        } finally {
                          setResolving(false);
                        }
                      }}
                    >
                      Resolved ?
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default NotificationIconUser;
