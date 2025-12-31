import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Resolve a notification by id (protected route)
 * @param {number} id - Notification ID
 * @returns {Promise<object>} API response
 */
async function resolveNotification(id) {
  const response = await authFetch(
    `${API_ENDPOINTS.RESOLVE_NOTIFICATION}?id=${id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || "Failed to resolve notification",
      resolution: data.resolution,
    };
  }
  return data;
}

export { resolveNotification };
