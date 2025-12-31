import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a new admin notification (protected route)
 * @param {Object} notification - { details: string, assigned_to: array }
 * @returns {Promise<object>} API response
 */
async function createAdminNotification(notification) {
  const response = await authFetch(API_ENDPOINTS.CREATE_NOTIFICATION, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notification),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || "Failed to create notification",
      resolution: data.resolution,
    };
  }
  return data;
}

export { createAdminNotification };
