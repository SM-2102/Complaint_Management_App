import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BirthdayWish from "../components/BirthdayWish";
import HolidayWish from "../components/HolidayWish";
import MenuCard from "../components/MenuCard";
import CustomerChart from "../charts/CustomerChart";
import ChallanChart from "../charts/ChallanChart";
import WarrantyStatusChart from "../charts/WarrantyStatusChart";
import OutOfWarrantyStatusChart from "../charts/OutOfWarrantyStatusChart";
import OutOfWarrantyTimeline from "../charts/OutOfWarrantyTimeline";
import WarrantySRFDeliveryTimelineChart from "../charts/WarrantySRFDeliveryTimelineChart";
import RetailDivisionDonutChart from "../charts/RetailDivisionDonutChart";
import RetailSettledPieChart from "../charts/RetailSettledPieChart";
import VendorStatusChart from "../charts/VendorStatusChart";
import { useDashboardData } from "../hooks/useDashboardData";
import SpinnerLoading from "../components/SpinnerLoading";
import { menuConfig } from "../config/menuConfig";
import { fetchUserNotifications } from "../services/notificationUserService";
import { useAuth } from "../context/AuthContext";

// Helper to filter actions by company
const filterActionsByCompany = (actions, company) => {
  if (company === "ALL") return actions;
  return actions.filter((a) => a.company === company || a.company === "ALL");
};

const getFilteredCards = (company) =>
  menuConfig
    .map(({ actions, ...rest }) => {
      const filteredActions = filterActionsByCompany(actions, company);
      return filteredActions.length > 0
        ? {
            ...rest,
            actions: filteredActions,
            dashboardActions: filteredActions.filter(
              (a) => a.showInDashboard !== false,
            ),
          }
        : null;
    })
    .filter(Boolean);

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

  // On mount, check for birthday_names and holiday in location.state
  useEffect(() => {
    if (location.state) {
      if (
        Array.isArray(location.state.birthday_names) &&
        location.state.birthday_names.length > 0
      ) {
        setBirthdayNames(location.state.birthday_names);
        setShowBirthday(true);
      }
      if (location.state.holiday && location.state.holiday.name) {
        setHoliday(location.state.holiday);
        // Do not show holiday immediately if birthday is present
        if (
          !location.state.birthday_names ||
          location.state.birthday_names.length === 0
        ) {
          setShowHoliday(true);
        }
      }
    }
    // Fetch notifications on mount only if user.role is USER
    if (user && user.role === "USER") {
      fetchUserNotifications().then(setNotifications);
    }
  }, [location.state, user]);

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

  // Get filtered cards based on selected company
  const filteredCards = getFilteredCards(selectedCompany);

  return (
    <>
      <div className="flex flex-col min-h-[calc(100vh-7rem)] px-2 md:px-4 lg:px-8 bg-[#fff]">
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
        <div className="flex justify-end items-start w-full mt-2 mb-2">
          <div className="flex gap-2">
            {/* CGPISL Dot */}
            <button
              key="CGPISL"
              data-company-filter
              className={`h-5 w-5 rounded-full border transition-all duration-150 focus:outline-none
                ${selectedCompany === "CGPISL" ? "border-green-700 ring-1 ring-green-200" : "border-green-200 hover:ring-1 hover:ring-green-100"}
              `}
              style={{ backgroundColor: "#22c55e" }}
              onClick={() => setSelectedCompany("CGPISL")}
              aria-label="CGPISL"
            />
            {/* CGCEL Dot */}
            <button
              key="CGCEL"
              data-company-filter
              className={`h-5 w-5 rounded-full border transition-all duration-150 focus:outline-none
                ${selectedCompany === "CGCEL" ? "border-blue-700 ring-1 ring-blue-200" : "border-blue-200 hover:ring-1 hover:ring-blue-100"}
              `}
              style={{ backgroundColor: "#2563eb" }}
              onClick={() => setSelectedCompany("CGCEL")}
              aria-label="CGCEL"
            />
            {/* ALL Dot */}
            <button
              key="ALL"
              data-company-filter
              className={`h-5 w-5 rounded-full border transition-all duration-150 focus:outline-none
                ${selectedCompany === "ALL" ? "border-purple-700 ring-1 ring-purple-200" : "border-gray-200 hover:ring-1 hover:ring-purple-100"}
              `}
              style={{ backgroundColor: "purple" }}
              onClick={() => setSelectedCompany("ALL")}
              aria-label="ALL"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-grow min-w-0 w-full">
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
                className="min-h-[300px] max-w-full w-full"
              >
                {/* ...existing chart rendering logic... */}
                {key === "complaint" &&
                  (loading ? (
                    <div className="w-full flex justify-center items-center">
                      <SpinnerLoading text="Loading Customer Data ..." />
                    </div>
                  ) : error ? (
                    <div className="w-full flex justify-center items-center">
                      <SpinnerLoading text={`Error Loading ...`} />
                    </div>
                  ) : (
                    <CustomerChart data={data} />
                  ))}
                {key === "stock" &&
                  (loading ? (
                    <div className="w-full flex justify-center items-center">
                      <SpinnerLoading text="Loading Challan Data ..." />
                    </div>
                  ) : error ? (
                    <div className="w-full flex justify-center items-center">
                      <SpinnerLoading text={`Error Loading ...`} />
                    </div>
                  ) : (
                    <ChallanChart data={data} />
                  ))}
                {key === "grc" &&
                  (loading ? (
                    <div className="w-full flex justify-center items-center">
                      <SpinnerLoading text="Loading Retail Data ..." />
                    </div>
                  ) : error ? (
                    <div className="w-full flex justify-center items-center">
                      <SpinnerLoading text={`Error Loading ...`} />
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-0 items-start justify-start w-full">
                      <div className="w-full md:px-0">
                        <RetailDivisionDonutChart data={data} />
                      </div>
                      <div className="w-full md:px-0">
                        <RetailSettledPieChart data={data} />
                      </div>
                    </div>
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
