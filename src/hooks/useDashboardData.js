// Custom hook for fetching dashboard data

import { useContext, useCallback } from "react";
import { DashboardDataContext } from "../context/DashboardDataContext.jsx";

export const useDashboardData = () => {
  const { data, loading, error, fetchDashboardData } =
    useContext(DashboardDataContext);
  return { data, loading, error, refetch: fetchDashboardData };
};
