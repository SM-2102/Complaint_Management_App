import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a new user (protected route)
 * @param {{username: string, password: string, role: string, phone_number: string}} userData
 * @returns {Promise<void>} Throws on error
 */
async function createUser(userData) {
  const response = await authFetch(API_ENDPOINTS.CREATE_USER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { createUser };
