import React, { createContext, useContext, useState, useCallback } from "react";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "../services/authFetchService";

export const DashboardDataContext = createContext();

export const DashboardDataProvider = ({ children }) => {
  // Try to load from localStorage first
  const getInitialData = () => {
    try {
      const stored = localStorage.getItem("dashboardData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };
  const [data, setDataState] = useState(getInitialData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save to localStorage whenever data changes
  const setData = (newData) => {
    setDataState(newData);
    try {
      localStorage.setItem("dashboardData", JSON.stringify(newData));
    } catch {}
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(API_ENDPOINTS.MENU_DASHBOARD, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err);
      setData({
        complaint: {
          division_wise_status: [],
          complaint_type: {},
          all_complaints: 0,
          crm_open_complaints: 0,
          escalation_complaints: 0,
          spare_pending_complaints: 0,
          mail_to_be_sent_complaints: 0,
        },
        stock: {
          division_wise_donut: [],
          number_of_items_in_stock: {},
          number_of_items_in_godown: {},
          number_of_items_issued_in_advance: {},
          number_of_items_under_process: {},
        },
        grc: {
          division_wise_donut: [],
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DashboardDataContext.Provider
      value={{ data, loading, error, fetchDashboardData, setData }}
    >
      {children}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardDataContext = () => useContext(DashboardDataContext);
