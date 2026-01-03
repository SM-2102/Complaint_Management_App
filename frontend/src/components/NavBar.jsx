import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import { menuConfig } from "../config/menuConfig";
import { useAuth } from "../context/AuthContext";

// Define desired submenu order for each menu key
const submenuOrder = {
  complaint: [
    "Complaint Enquiry",
    "Report Generation",
    "Add New Complaint",
    "Update Complaint",
    "Create RFR Record",
    "Upload Complaints",
  ],
};

// Helper to sort actions by submenuOrder
function sortActions(key, actions) {
  const order = submenuOrder[key];
  if (!order) return actions;
  return [...actions].sort(
    (a, b) => order.indexOf(a.label) - order.indexOf(b.label),
  );
}

function filterActionsForRole(actions, isAdmin) {
  if (isAdmin) return actions;
  return actions.filter(
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
}

const NavBar = ({ open, setOpen, company = "ALL" }) => {
  const [submenuOpen, setSubmenuOpen] = useState([]);
  const overlayRef = useRef(null);
  const { user } = useAuth();
  const isAdmin = user && user.role === "ADMIN";

  // Convert menuConfig to menuItems for NavBar (submenus = actions, reordered, filtered)
  // Special handling: Render 'Complaint Enquiry' and 'Add Dealer Record' as top-level menu items
  let menuItems = [];
  menuConfig.forEach(({ key, title, actions }) => {
    const filteredSubmenus = sortActions(
      key,
      filterActionsForRole(actions, isAdmin),
    ).filter(({ company: actionCompany }) => {
      if (!actionCompany) return true;
      if (company === "ALL") {
        return (
          actionCompany === "ALL" ||
          actionCompany === "CGCEL" ||
          actionCompany === "CGPISL"
        );
      } else if (company === "CGCEL") {
        return actionCompany === "ALL" || actionCompany === "CGCEL";
      } else if (company === "CGPISL") {
        return actionCompany === "ALL" || actionCompany === "CGPISL";
      }
      return false;
    });

    // Extract 'Complaint Enquiry' if present
    if (key === "complaint") {
      const enquiryIdx = filteredSubmenus.findIndex(
        (a) => a.label === "Complaint Enquiry",
      );
      if (enquiryIdx !== -1) {
        const enquiry = filteredSubmenus.splice(enquiryIdx, 1)[0];
        menuItems.push({
          title: enquiry.label,
          path: enquiry.path,
          isDirect: true,
        });
      }
    }

    if (filteredSubmenus.length > 0) {
      const isDisabled =
        company === "ALL" && (key === "stock" || key === "grc");
      menuItems.push({
        title,
        submenus: filteredSubmenus.map(({ label, path }) => ({
          title: label,
          path,
        })),
        isDirect: false,
        disabled: isDisabled,
      });
    }
  });

  // Add 'Dealer' menu with two submenus
  menuItems.push({
    title: "Dealer",
    submenus: [
      { title: "Add Dealer Record", path: "/DealerCreate" },
      { title: "Update Dealer Record", path: "/DealerUpdate" },
    ],
    isDirect: false,
    disabled: false,
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  // Close all submenus when NavBar is closed
  useEffect(() => {
    if (!open) setSubmenuOpen([]);
  }, [open]);

  // Open submenu on hover
  const handleSubmenuEnter = (idx, disabled) => {
    if (disabled) return;
    setSubmenuOpen((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  };
  // Close submenu on mouse leave
  const handleSubmenuLeave = (idx, disabled) => {
    if (disabled) return;
    setSubmenuOpen((prev) => prev.filter((i) => i !== idx));
  };

  if (!open) return null;

  return (
    <div
      className="fixed top-0 left-0 w-80 max-w-[90vw] h-screen bg-black/10 backdrop-blur-xl z-[1200] shadow-2xl flex flex-col animate-fade-in"
      ref={overlayRef}
    >
      {/* NavBar button and title at the top */}
      <div className="flex items-center h-22 px-4 border-b border-blue-200/30 ml-4 relative">
        <button
          className="w-10 h-10 rounded-full hover:bg-blue-700 text-white transition-colors duration-200 focus:outline-none flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2"
          onClick={() => setOpen(false)}
          title="Close Navigation Bar"
        >
          <FaBars className="text-2xl" />
        </button>
        <span className="ml-16 text-2xl font-bold text-black tracking-wide">
          Navigation Bar
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, idx) =>
          item.isDirect ? (
            <div className="mb-2" key={item.title}>
              <Link
                to={item.path}
                className="flex items-center text-black font-semibold px-6 py-3 rounded-md cursor-pointer hover:bg-blue-900/30 transition select-none"
                onClick={() => setOpen(false)}
              >
                <span>{item.title}</span>
              </Link>
            </div>
          ) : (
            <div
              key={item.title}
              className="mb-2"
              onMouseEnter={() => handleSubmenuEnter(idx, item.disabled)}
              onMouseLeave={() => handleSubmenuLeave(idx, item.disabled)}
            >
              <div
                className={`flex items-center px-6 py-3 rounded-md select-none transition
  ${
    item.disabled
      ? "text-black cursor-not-allowed bg-transparent"
      : "text-black font-semibold cursor-pointer bg-transparent hover:bg-blue-900/30"
  }`}
              >
                <span>{item.title}</span>

                {!item.disabled &&
                  (submenuOpen.includes(idx) ? (
                    <FaChevronUp className="ml-2 text-blue-700" />
                  ) : (
                    <FaChevronDown className="ml-2 text-blue-700" />
                  ))}
              </div>

              {!item.disabled &&
                submenuOpen.includes(idx) &&
                item.submenus &&
                item.submenus.length > 0 && (
                  <div className="ml-4 mt-1 flex flex-col">
                    {item.submenus.map((sub) => (
                      <Link
                        key={sub.title}
                        to={sub.path}
                        className="text-black no-underline text-sm px-6 py-2 rounded hover:bg-blue-700/30 hover:text-white transition"
                        onClick={() => setOpen(false)}
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default NavBar;
