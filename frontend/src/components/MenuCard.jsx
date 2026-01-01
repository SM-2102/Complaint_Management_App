import React, { useState, useRef, useEffect } from "react";
import { FiBookOpen } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Reusable MenuCard component with action-overlay support.
 * Props:
 * - title: string (required)
 * - children: React nodes (optional)
 * - onClick: function (optional) - legacy, not required when using actions
 * - icon: React node (optional)
 * - actions: Array<{ label: string, path: string }> (optional) - action buttons shown on overlay
 */
const MenuCard = ({
  title,
  children,
  onClick,
  icon,
  actions = [],
  dashboardActions = [],
  bgColor,
  cardKey,
  openCardKey,
  setOpenCardKey,
}) => {
  const [showBook, setShowBook] = useState(false);
  const { user } = useAuth();
  const isAdmin = user && user.role === "ADMIN";
  // Only show actions that do not require ADMIN, or all if admin
  const filteredActions = isAdmin
    ? actions
    : actions.filter(
        (a) =>
          !(
            a.path === "/CreateEmployee" ||
            a.path === "/DeleteEmployee" ||
            a.path === "/ShowAllEmployees" ||
            a.path === "/CreateNotification" ||
            a.path === "/UploadComplaints" ||
            a.path === "/UploadCGCELStockRecords" ||
            a.path === "/UploadCGPISLStockRecords" ||
            a.path === "/UploadCGCELGRCRecords" ||
            a.path === "/UploadCGPISLGRCRecords"
          ),
      );
  const filteredDashboardActions = isAdmin
    ? dashboardActions
    : dashboardActions.filter(
        (a) =>
          !(
            a.path === "/CreateEmployee" ||
            a.path === "/DeleteEmployee" ||
            a.path === "/ShowAllEmployees" ||
            a.path === "/CreateNotification" ||
            a.path === "/UploadComplaints" ||
            a.path === "/UploadCGCELStockRecords" ||
            a.path === "/UploadCGPISLStockRecords" ||
            a.path === "/UploadCGCELGRCRecords" ||
            a.path === "/UploadCGPISLGRCRecords"
          ),
      );
  useEffect(() => {
    const interval = setInterval(() => setShowBook((v) => !v), 1500);
    return () => clearInterval(interval);
  }, [title]);
  const isOpen = openCardKey === cardKey;
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutside = (e) => {
      if (isOpen && ref.current && !ref.current.contains(e.target)) {
        setOpenCardKey(null);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, setOpenCardKey]);

  const handleCardClick = (e) => {
    // If actions exist, toggle the overlay instead of invoking onClick
    if (filteredActions && filteredActions.length > 0) {
      if (!isOpen) {
        setOpenCardKey(cardKey);
      } else {
        setOpenCardKey(null);
      }
      return;
    }
    if (onClick) onClick(e);
  };

  const gradientBarClass = isOpen
    ? "w-full transition-all duration-500"
    : "w-0 transition-all duration-500";

  return (
    <div
      ref={ref}
      role={onClick || (actions && actions.length > 0) ? "button" : "group"}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (
          (onClick || (actions && actions.length > 0)) &&
          (e.key === "Enter" || e.key === " ")
        )
          handleCardClick(e);
      }}
      className={`relative rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200 ease-in-out pt-4 pl-4 pr-5 flex flex-col justify-start focus:outline-none h-[330px] w-full max-w-xl`}
      style={{ background: bgColor || "#fff" }}
    >
      {/* animated bluish left-to-right bar */}
      <div
        className={`absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-300 opacity-20 ${gradientBarClass}`}
        aria-hidden="true"
      />

      {/* overlay that contains action buttons when open */}
      {isOpen &&
        filteredDashboardActions &&
        filteredDashboardActions.length > 0 && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10 px-4">
            {(() => {
              let containerClass = "";
              const buttonClass =
                "px-2 py-2 w-[190px] text-md gap-2 flex items-center justify-center";
              // Default layout: 2-column grid for 3–4 buttons
              if (filteredDashboardActions.length === 1) {
                containerClass = "flex flex-col items-center w-full max-w-xs";
              } else if (filteredDashboardActions.length > 6) {
                containerClass =
                  "grid grid-cols-2 max-w-[520px] w-full gap-2 place-items-center";
              } else {
                containerClass =
                  "grid grid-cols-1 max-w-[250px] w-full gap-2 place-items-center";
              }

              return (
                <div className={containerClass}>
                  {filteredDashboardActions.map((a, idx) => {
                    // For the 5-button case: center the last one
                    // Determine color classes based on company
                    let colorClass = "";
                    if (a.company && a.company === "CGPISL") {
                      colorClass =
                        "text-white bg-gradient-to-br from-green-600 via-emerald-500 to-green-600 hover:from-green-600 hover:to-emerald-300 hover:bg-white/95 btn-texture";
                    } else if (a.company && a.company === "CGCEL") {
                      colorClass =
                        "text-white bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-600 hover:to-cyan-300 hover:bg-white/95 btn-texture";
                    } else {
                      colorClass =
                        "text-white bg-gradient-to-br from-purple-600 via-fuchsia-500 to-purple-600 hover:from-purple-600 hover:to-fuchsia-300 hover:bg-white/95 btn-texture";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (a.path) navigate(a.path);
                        }}
                        className={`${buttonClass} rounded-md font-medium ${colorClass} hover:scale-105 transform transition-all duration-150 relative overflow-hidden`}
                        style={{ position: "relative", zIndex: 1 }}
                      >
                        <span style={{ position: "relative", zIndex: 2 }}>
                          {a.label}
                        </span>
                        {/* Subtle texture overlay */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 opacity-20 pointer-events-none"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 8px)",
                            zIndex: 1,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

      <div className="flex items-start justify-between">
        <div className="relative group flex flex-col justify-center min-h-[2.8em] h-[2.8em]">
          <h3
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-800 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-500 transition-all duration-300 menu-card-title flex items-center h-full"
            style={{
              fontFamily: "Times New Roman, serif",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxHeight: "2.8em",
              minHeight: "2.8em",
              lineHeight: 1.2,
              fontSize: "1.5rem",
              alignItems: "center",
              width: "100%",
              textAlign: "left",
            }}
            title={title}
          >
            <span
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              {title}
            </span>
          </h3>
          <style>{`
            @media (max-width: 600px) {
              .menu-card-title {
                font-size: 1.1rem !important;
                max-height: 2.4em;
                min-height: 2.4em;
              }
            }
            .menu-card-title.shrink {
              font-size: 1.1rem !important;
              max-height: 3.6em;
              min-height: 3.6em;
            }
          `}</style>
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 group-hover:w-full transition-all duration-300"></div>
        </div>
        <div
          className="inline-flex items-center justify-center h-12 w-12 rounded-full shadow-inner cursor-pointer relative border border-white"
          style={{
            background: bgColor || "#fff",
            color: "#444",
            borderWidth: 2,
            borderColor: "#ace5fcff",
          }}
          aria-label="Card Icon"
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            {icon ? (
              React.isValidElement(icon) ? (
                React.cloneElement(icon, { className: "h-6 w-6" })
              ) : (
                icon
              )
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m4 4v-6a2 2 0 00-2-2h-3"
                />
              </svg>
            )}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 w-full">{children}</div>
    </div>
  );
};

export default MenuCard;
