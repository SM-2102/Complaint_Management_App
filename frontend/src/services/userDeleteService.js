import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Delete a user by username
 * @param {string} username
 * @returns {Promise<object>} Result of deletion
 */
async function deleteUser(username) {
  const response = await authFetch(`${API_ENDPOINTS.DELETE_USER}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { deleteUser };
