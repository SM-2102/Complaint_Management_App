import { data } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch all users (for ShowEmployees component)
 * @returns {Promise<Array>} List of users
 */
async function fetchComplaintNumbers() {
  const response = await authFetch(API_ENDPOINTS.COMPLAINT_ALL_COMPLAINTS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message:
        data.message || data.detail || "Failed to fetch complaint numbers",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { fetchComplaintNumbers };
