import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Search master by code
 * @param {string} spare_code
 * @returns {Promise<object>} Master data
 */
async function searchCGPISLByCode(spare_code) {
  const response = await authFetch(API_ENDPOINTS.STOCK_CGPISL_SEARCH_CODE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ spare_code }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to search CGPISL by code",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { searchCGPISLByCode };
