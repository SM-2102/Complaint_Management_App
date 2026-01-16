import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Search master by code
 * @param {string} complaint_number
 * @returns {Promise<object>} Customer data
 */
async function searchComplaintByNumberRFR(complaint_number) {
  const url = `${API_ENDPOINTS.COMPLAINT_SEARCH_NUMBER_RFR.replace(/\/$/, "")}/${encodeURIComponent(complaint_number)}`;
  const response = await authFetch(url, {
    method: "GET",
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message:
        data.message || data.detail || "Failed to search by complaint number",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { searchComplaintByNumberRFR };
