import { data } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch all users (for ShowEmployees component)
 * @returns {Promise<Array>} List of users
 */
async function fetchComplaintCreateData() {
  const response = await authFetch(API_ENDPOINTS.COMPLAINT_CREATE_DATA, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to fetch complaint create data",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { fetchComplaintCreateData };