import API_ENDPOINTS from "../config/api.js";
import { authFetch } from "./authFetchService";

/**
 * Change user password
 * @param {string} username
 * @param {string} old_password
 * @param {string} new_password
 * @returns {Promise<object>} Result of password change
 */
async function changePassword(username, old_password, new_password) {
  const response = await authFetch(API_ENDPOINTS.CHANGE_PASSWORD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, old_password, new_password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
  return data;
}

export { changePassword };
