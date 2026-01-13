import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BirthdayWish from "../components/BirthdayWish";
import HolidayWish from "../components/HolidayWish";
import MenuCard from "../components/MenuCard";
import GRCBarChart from "../charts/GRCBarChart";
import { useDashboardData } from "../hooks/useDashboardData";
import SpinnerLoading from "../components/SpinnerLoading";
import { menuConfig } from "../config/menuConfig";
import { fetchUserNotifications } from "../services/notificationUserService";
import { useAuth } from "../context/AuthContext";
import StockDivisionDonutChart from "../charts/StockDivisionDonutChart";
import ComplaintStatusChart from "../charts/ComplaintStatusChart";
import ComplaintTypePieChart from "../charts/ComplaintTypePieChart";

import ComplaintStatsCards from "../components/ComplaintStatsCards";

// Helper to filter actions by company
const filterActionsByCompany = (actions, company) => {
  if (company === "ALL") return actions;
  return actions.filter((a) => a.company === company || a.company === "ALL");
};

const normalizeDivisionData = (arr = []) =>
  arr.map(({ division, count }) => ({
    division,
    count: count || 0,
  }));

const mergeDivisionData = (...arrays) => {
  const merged = {};
  arrays.flat().forEach(({ division, count }) => {
    if (!merged[division]) {
      merged[division] = { division, count: 0 };
    }
    merged[division].count += count || 0;
  });
  return Object.values(merged);
};

const getFilteredCards = (company) =>
  menuConfig.map(({ key, actions = [], ...rest }) => {
    let filteredActions;

    if (company === "ALL" && ["stock", "grc"].includes(key)) {
      filteredActions = actions.filter((a) => a.company === "ALL");
    } else {
      filteredActions = filterActionsByCompany(actions, company);
    }

    return {
      key,
      ...rest,
      actions: filteredActions, // may be empty — that's OK
      dashboardActions: filteredActions.filter(
        (a) => a.showInDashboard !== false,
      ),
    };
  });

const MenuDashboardPage = ({ selectedCompany, setSelectedCompany }) => {
  const { data, loading, error, refetch } = useDashboardData();
  const location = useLocation();
  const navigate = useNavigate();
  const [showBirthday, setShowBirthday] = useState(false);
  const [birthdayNames, setBirthdayNames] = useState([]);
  const [showHoliday, setShowHoliday] = useState(false);
  const [holiday, setHoliday] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const birthdayCheckedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (birthdayCheckedRef.current) return;
    birthdayCheckedRef.current = true;

    // Only show wishes if there's an explicit "wishes_pending" signal
    // This flag should be set at login (either via navigation state or sessionStorage)
    const navState = location?.state || {};
    const pendingFromNav = !!navState.wishes_pending;
    const pendingFromSession = sessionStorage.getItem("wishes_pending") === "1";

    // If no pending flag, don't show wishes (prevents showing on every visit)
    if (!pendingFromNav && !pendingFromSession) {
      // If there was transient nav state but no pending flag, clear it to avoid accidental re-use
      if (Object.keys(navState).length > 0) {
        try {
          navigate(location.pathname, { replace: true, state: {} });
        } catch (e) {
          // ignore navigation errors
        }
      }
      return;
    }

    // --- If navigation state contains wishes and the pending flag, consume it ---
    if (pendingFromNav) {
      if (
        Array.isArray(navState.birthday_names) &&
        navState.birthday_names.length > 0
      ) {
        setBirthdayNames(navState.birthday_names);
        setShowBirthday(true);
      }
      if (navState.holiday && navState.holiday.name) {
        setHoliday(navState.holiday);
        // do not show holiday immediately here; BirthdayWish onDone will trigger showHoliday
      }
      // Clear transient navigation state so it doesn't re-trigger on back/refresh
      try {
        navigate(location.pathname, { replace: true, state: {} });
      } catch (e) {
        // ignore navigation errors
      }
      // Ensure session flag is cleared if present
      sessionStorage.removeItem("wishes_pending");
      return;
    }

    // --- Otherwise consume from sessionStorage (set by login flow) ---
    const storedBirthday = sessionStorage.getItem("birthday_names");
    if (storedBirthday) {
      try {
        const names = JSON.parse(storedBirthday);
        if (Array.isArray(names) && names.length > 0) {
          setBirthdayNames(names);
          setShowBirthday(true);
        }
      } catch {
        console.error("Invalid birthday_names in sessionStorage");
      }
      sessionStorage.removeItem("birthday_names");
    }

    const storedHoliday = sessionStorage.getItem("holiday");
    if (storedHoliday) {
      try {
        const h = JSON.parse(storedHoliday);
        if (h && h.name) {
          setHoliday(h);
        }
      } catch {
        console.error("Invalid holiday in sessionStorage");
      }
      sessionStorage.removeItem("holiday");
    }

    // Clear the session flag after consuming
    sessionStorage.removeItem("wishes_pending");
  }, [location, navigate]);
useEffect(() => {
  if (user && user.role === "USER") {
    fetchUserNotifications().then(setNotifications);
  }
}, [user]);




  // Show holiday after birthday wish is fully done (fade-out complete)
  useEffect(() => {
    let holidayTimer;
    if (showHoliday && holiday) {
      holidayTimer = setTimeout(() => setShowHoliday(false), 5000);
    }
    return () => {
      if (holidayTimer) clearTimeout(holidayTimer);
    };
  }, [showHoliday, holiday]);

  const queryParams = new URLSearchParams(location.search);
  const openCardKey = queryParams.get("open") || null;

  const handleOpenCardKey = (key) => {
    const params = new URLSearchParams(location.search);
    if (key) {
      params.set("open", key);
    } else {
      params.delete("open");
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  // Stock division data
  const divisionData = useMemo(() => {
    const donut = data?.stock?.division_wise_donut;
    if (!donut) return [];
    if (selectedCompany === "ALL") {
      return mergeDivisionData(
        normalizeDivisionData(donut.CGCEL),
        normalizeDivisionData(donut.CGPISL),
      );
    }
    return normalizeDivisionData(donut[selectedCompany]);
  }, [data, selectedCompany]);

  // GRC division data
  const grcDivisionData = useMemo(() => {
    const donut = data?.grc?.division_wise_donut;
    if (!donut) return [];
    if (selectedCompany === "ALL") {
      return mergeDivisionData(
        normalizeDivisionData(donut.CGCEL),
        normalizeDivisionData(donut.CGPISL),
      );
    }
    return normalizeDivisionData(donut[selectedCompany]);
  }, [data, selectedCompany]);

  // Complaint division status data
  const complaintDivisionStatus = useMemo(() => {
    const status = data?.complaint?.division_wise_status;
    if (!status) return [];
    if (selectedCompany === "ALL") {
      // Merge CGCEL and CGPISL arrays
      return [...(status.CGCEL || []), ...(status.CGPISL || [])];
    }
    return status[selectedCompany] || [];
  }, [data, selectedCompany]);

  // Complaint type pie chart data
  const complaintTypeData = useMemo(() => {
    const typeData = data?.complaint?.complaint_type;
    if (!typeData) return [];
    if (selectedCompany === "ALL") {
      // Merge CGCEL and CGPISL arrays by type
      const merged = {};
      [...(typeData.CGCEL || []), ...(typeData.CGPISL || [])].forEach(
        ({ type, count }) => {
          if (!merged[type]) merged[type] = { type, count: 0 };
          merged[type].count += count || 0;
        },
      );
      return Object.values(merged);
    }
    return typeData[selectedCompany] || [];
  }, [data, selectedCompany]);

  // Complaint stats for cards (updated fields)
  const complaintStats = useMemo(() => {
    const c = data?.complaint;
    if (!c) return [];
    const getVal = (obj) => {
      if (!obj) return 0;
      if (selectedCompany === "ALL") {
        return (obj.CGCEL || 0) + (obj.CGPISL || 0);
      }
      return obj[selectedCompany] || 0;
    };
    return [
      {
        title: "All Complaints",
        value: getVal(c.all_complaints),
        cardKey: "all_complaints",
      },
      {
        title: "CRM Open Complaints",
        value: getVal(c.crm_open_complaints),
        cardKey: "crm_open_complaints",
      },
      {
        title: "Escalation Complaints",
        value: getVal(c.escalation_complaints),
        cardKey: "escalation_complaints",
      },
      {
        title: "Spare Pending Complaints",
        value: getVal(c.spare_pending_complaints),
        cardKey: "spare_pending_complaints",
      },
      {
        title: "Mails to be Sent",
        value: getVal(c.mail_to_be_sent_complaints),
        cardKey: "mail_to_be_sent_complaints",
      },
    ];
  }, [data, selectedCompany]);

  const meta = useMemo(() => {
    const stock = data?.stock;
    if (!stock) return null;
    const calc = (key) => {
      const values = stock[key] || {};
      if (selectedCompany === "ALL") {
        return (values.CGCEL || 0) + (values.CGPISL || 0);
      }
      return values[selectedCompany] || 0;
    };
    return {
      totalStock: calc("number_of_items_in_stock"),
      totalGodown: calc("number_of_items_in_godown"),
      totalIssuedInAdvance: calc("number_of_items_issued_in_advance"),
      totalUnderProcess: calc("number_of_items_under_process"),
    };
  }, [data, selectedCompany]);

  // Get filtered cards based on selected company
  const filteredCards = getFilteredCards(selectedCompany);

  // Handler for ComplaintStatsCards click
  const handleComplaintStatCardClick = async (cardKey) => {
    const params = new URLSearchParams();
    if (cardKey) {
      params.set(cardKey, "Y");
    }
    if (selectedCompany) {
      params.set("complaint_head", selectedCompany);
    } else {
      params.delete("complaint_head");
    }
    navigate({ pathname: "/ComplaintEnquiry", search: params.toString() });
  };
 

  return (
    <>
      <div className="flex flex-col min-h-[calc(100vh-7rem)] px-2 md:px-4 lg:px-8 bg-[#fff]">
        {/* Complaint Stats Cards */}
        {showBirthday && (
          <BirthdayWish
            names={birthdayNames}
            onDone={() => {
              setShowBirthday(false);
              if (holiday && holiday.name) {
                setShowHoliday(true);
              }
            }}
          />
        )}
        {!showBirthday && showHoliday && <HolidayWish holiday={holiday} />}

        {/* Discreet Company Filter Dots - Top Right Corner, No SVG, Minimal Focus */}
        <div className="flex justify-end items-start w-full mt-3 mb-4">
          <div className="flex gap-2">
            {/* CGPISL Dot */}
            <button
              key="CGPISL"
              data-company-filter
              className="relative h-5 w-5 rounded-full border transition-colors duration-150 focus:outline-none border-green-200"
              style={{ backgroundColor: "#22c55e" }}
              onClick={() => setSelectedCompany("CGPISL")}
              aria-label="CGPISL"
            >
              {selectedCompany === "CGPISL" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              )}
            </button>
            {/* CGCEL Dot */}
            <button
              key="CGCEL"
              data-company-filter
              className="relative h-5 w-5 rounded-full border transition-colors duration-150 focus:outline-none border-green-200"
              style={{ backgroundColor: "#2563eb" }}
              onClick={() => setSelectedCompany("CGCEL")}
              aria-label="CGCEL"
            >
              {selectedCompany === "CGCEL" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              )}
            </button>
            {/* ALL Dot */}
            <button
              key="ALL"
              data-company-filter
              className="relative h-5 w-5 rounded-full border transition-colors duration-150 focus:outline-none border-green-200"
              style={{ backgroundColor: "purple" }}
              onClick={() => setSelectedCompany("ALL")}
              aria-label="ALL"
            >
              {selectedCompany === "ALL" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              )}
            </button>
          </div>
        </div>
        <ComplaintStatsCards
          stats={complaintStats}
          onCardClick={handleComplaintStatCardClick}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-grow min-w-0 w-full mt-2">
          {filteredCards.map(
            ({ key, title, icon, actions, dashboardActions, bgColor }) => (
              <MenuCard
                key={key}
                cardKey={key}
                openCardKey={openCardKey}
                setOpenCardKey={handleOpenCardKey}
                title={title}
                icon={icon ? React.createElement(icon) : null}
                actions={actions}
                dashboardActions={dashboardActions}
                bgColor={bgColor}
                className="min-h-[330px] max-w-full w-full"
              >
                {/* ...existing chart rendering logic... */}
                {key === "complaint" &&
                  (loading ? (
                    <div className="w-full flex justify-center items-center flex-1 h-full">
                      <SpinnerLoading text="Loading Complaint Data ..." />
                    </div>
                  ) : error ? (
                    <div className="w-full flex justify-center items-center flex-1 h-full">
                      <SpinnerLoading text={`Error Loading ...`} />
                    </div>
                  ) : (
                    <div className="flex flex-row gap-2 w-full items-stretch">
                      <div className="flex-1 h-full items-center justify-center">
                        <ComplaintStatusChart data={complaintDivisionStatus} />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-center">
                        <ComplaintTypePieChart data={complaintTypeData} />
                      </div>
                    </div>
                  ))}
                {key === "stock" &&
                  (loading ? (
                    <div className="w-full flex justify-center items-center flex-1 h-full">
                      <SpinnerLoading text="Loading Stock Data ..." />
                    </div>
                  ) : error ? (
                    <div className="w-full flex justify-center items-center flex-1 h-full">
                      <SpinnerLoading text={`Error Loading ...`} />
                    </div>
                  ) : (
                    <StockDivisionDonutChart data={divisionData} meta={meta} />
                  ))}
                {key === "grc" &&
                  (loading ? (
                    <div className="w-full flex justify-center items-center flex-1 h-full">
                      <SpinnerLoading text="Loading GRC Data ..." />
                    </div>
                  ) : error ? (
                    <div className="w-full flex justify-center items-center flex-1 h-full">
                      <SpinnerLoading text={`Error Loading ...`} />
                    </div>
                  ) : (
                    <GRCBarChart
                      data={grcDivisionData}
                      className="flex-1 h-full"
                    />
                  ))}
              </MenuCard>
            ),
          )}
        </div>
      </div>
    </>
  );
};

export default MenuDashboardPage;
