import React, { createContext, useContext, useState, useCallback } from "react";
import API_ENDPOINTS from "../config/api";

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
      const response = await fetch(API_ENDPOINTS.MENU_DASHBOARD, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err);
      setData({
        customer: {
          number_of_customers: 0,
          number_of_asc_names: 0,
          top_customers: [],
        },
        challan: { number_of_challans: 0, number_of_items: 0 },
        vendor: { status_per_division_stacked_bar_chart: [], total_vendors: 0 },
        retail: { division_wise_donut: [], settled_vs_unsettled_pie_chart: [] },
        warranty: {
          division_wise_pending_completed_bar_graph: [],
          srf_vs_delivery_month_wise_bar_graph: [],
          warranty_heads: 0,
        },
        out_of_warranty: {
          srf_receive_vs_delivery_bar_graph: [],
          final_status_bar_graph: [],
          out_of_warranty_count: 0,
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
