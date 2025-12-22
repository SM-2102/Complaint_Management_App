import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch standard users (for ShowStandardUsersPage)
 * @returns {Promise<Array>} List of standard users
 */
async function fetchStandardUsers() {
  const response = await authFetch(API_ENDPOINTS.GET_STANDARD_USERS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to fetch users",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { fetchStandardUsers };
