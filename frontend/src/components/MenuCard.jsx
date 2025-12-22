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
            a.path === "/CreateUser" ||
            a.path === "/DeleteUser" ||
            a.path === "/ShowAllUsers" ||
            a.path === "/FinalSettlementRetailRecord" ||
            a.path === "/FinalSettlementWarrantySRF" ||
            a.path === "/FinalSettlementOutOfWarrantySRF" ||
            a.path === "/FinalSettlementVendor" ||
            a.path === "/UploadComplaintNumber" ||
            a.path === "/CreateASCName" ||
            a.path === "/UploadCGSRFNumber"
          ),
      );
  const filteredDashboardActions = isAdmin
    ? dashboardActions
    : dashboardActions.filter(
        (a) =>
          !(
            a.path === "/CreateUser" ||
            a.path === "/DeleteUser" ||
            a.path === "/ShowAllUsers" ||
            a.path === "/FinalSettlementRetailRecord" ||
            a.path === "/FinalSettlementWarrantySRF" ||
            a.path === "/FinalSettlementOutOfWarrantySRF" ||
            a.path === "/FinalSettlementVendor" ||
            a.path === "/UploadComplaintNumber" ||
            a.path === "/CreateASCName" ||
            a.path === "/UploadCGSRFNumber"
          ),
      );
  useEffect(() => {
    if (!shouldShowEnquiry(title)) return;
    const interval = setInterval(() => setShowBook((v) => !v), 1500);
    return () => clearInterval(interval);
  }, [title]);
  const isOpen = openCardKey === cardKey;
  const ref = useRef(null);
  const navigate = useNavigate();

  // Function to check if the card should show enquiry
  const shouldShowEnquiry = (cardTitle) => {
    const normalizedTitle = cardTitle?.toLowerCase().trim() || "";
    return (
      !normalizedTitle.includes("master") &&
      !normalizedTitle.includes("challan") &&
      !normalizedTitle.includes("vendor")
    );
  };

  // Get the enquiry action path if available
  const getEnquiryPath = () => {
    if (filteredActions && filteredActions.length > 0) {
      const enquiryAction = filteredActions.find(
        (a) => a.label.toLowerCase() === "enquiry" && a.path,
      );
      return enquiryAction ? enquiryAction.path : null;
    }
    return null;
  };

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
      className={`relative rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200 ease-in-out p-6 flex flex-col justify-between focus:outline-none h-[300px] w-full max-w-xl`}
      style={{ background: bgColor || "#fff" }}
    >
      {/* animated bluish left-to-right bar */}
      <div
        className={`absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-20 ${gradientBarClass}`}
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
                "px-3 py-2 w-[172px] text-sm gap-1.5 flex items-center justify-center border border-transparent shadow-sm";

              if (filteredDashboardActions.length === 1) {
                // Single button centered
                containerClass = "flex justify-center items-center w-full";
              } else if (filteredDashboardActions.length === 2) {
                // Two buttons stacked vertically
                containerClass =
                  "grid grid-cols-1 max-w-[200px] w-full gap-2.5 place-items-center";
              } else if (filteredDashboardActions.length === 3) {
                // Three buttons stacked vertically
                containerClass =
                  "grid grid-cols-1 max-w-[350px] w-full gap-2.5 place-items-center";
              } else {
                // Default layout: 2-column grid for 3–4 buttons
                containerClass =
                  "grid grid-cols-2 max-w-[350px] w-full gap-2.5 place-items-center";
              }

              return (
                <div className={containerClass}>
                  {filteredDashboardActions.map((a, idx) => {
                    // For the 5-button case: center the last one
                    const specialClass =
                      filteredDashboardActions.length === 5 && idx === 4
                        ? "col-span-2 justify-self-center"
                        : "";

                    return (
                      <button
                        key={idx}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (a.path) navigate(a.path);
                          // Do not close overlay here; let browser navigation handle state
                        }}
                        className={`${buttonClass} ${specialClass} rounded-md bg-white/95 border border-white/40 shadow-sm hover:shadow-md font-medium text-blue-800 hover:bg-white hover:scale-105 transform transition-all duration-150`}
                      >
                        {a.label}
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
          onClick={(e) => {
            if (shouldShowEnquiry(title)) {
              e.stopPropagation();
              const enquiryPath = getEnquiryPath();
              if (enquiryPath) {
                navigate(enquiryPath);
              } else {
                navigate("/page-not-available");
              }
            }
          }}
          tabIndex={shouldShowEnquiry(title) ? 0 : -1}
          aria-label={shouldShowEnquiry(title) ? "Enquiry" : "Card Icon"}
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
            {shouldShowEnquiry(title) && showBook ? (
              <FiBookOpen className="h-6 w-6 text-blue-600" />
            ) : icon ? (
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

      <div className="text-gray-600">{children}</div>
    </div>
  );
};

export default MenuCard;
