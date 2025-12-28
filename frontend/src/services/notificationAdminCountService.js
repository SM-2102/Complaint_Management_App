import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch user notifications (protected route)
 * @returns {Promise<string[]>} Array of notification details
 */
async function fetchAdminCountNotifications() {
  const response = await authFetch(API_ENDPOINTS.COUNT_NOTIFICATIONS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || "Failed to fetch notifications",
      resolution: data.resolution,
    };
  }
  return data;
}

export { fetchAdminCountNotifications };
