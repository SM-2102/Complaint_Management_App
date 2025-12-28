import { data } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch warranty enquiry records with optional filters
 * @param {Object} params - Filter params: final_status, name, division, delivery_date
 * @returns {Promise<Array>} List of warranty enquiry records
 */
async function stockCGCELEnquiry(params = {}) {
  // Build query string from params
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const url = query
    ? `${API_ENDPOINTS.STOCK_CGCEL_ENQUIRY}?${query}`
    : API_ENDPOINTS.STOCK_CGCEL_ENQUIRY;
  const response = await authFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to fetch records",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { stockCGCELEnquiry };
