import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Search master by code
 * @param {string} spare_code
 * @returns {Promise<object>} Master data
 */
async function searchCGCELByCode(spare_code) {
  const response = await authFetch(API_ENDPOINTS.STOCK_CGCEL_SEARCH_CODE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ spare_code }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to search CGCEL by code",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { searchCGCELByCode };
