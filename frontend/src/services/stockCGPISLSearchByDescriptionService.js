import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Search master by code
 * @param {string} spare_description
 * @returns {Promise<object>} Master data
 */
async function searchCGPISLByDescription(spare_description) {
  const response = await authFetch(API_ENDPOINTS.STOCK_CGPISL_SEARCH_NAME, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ spare_description }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to search CGPISL by name",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { searchCGPISLByDescription };
