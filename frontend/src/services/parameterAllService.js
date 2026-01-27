import { data } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch all users (for ShowEmployees component)
 * @returns {Promise<Array>} List of parameters
 */
async function fetchAllParameters() {
  const response = await authFetch(API_ENDPOINTS.PARAMETER_LIST, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to fetch parameters",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { fetchAllParameters };