import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Delete a user by name and leaving_date
 * @param {string} name
 * @param {string} leaving_date (YYYY-MM-DD)
 * @returns {Promise<object>} Result of deletion
 */
async function deleteEmployee(name, leaving_date) {
  const response = await authFetch(`${API_ENDPOINTS.DELETE_USER}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, leaving_date }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { deleteEmployee };
