import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Search master by name
 * @param {string} name
 * @returns {Promise<object>} Customer data
 */
async function searchCustomerByNameForComplaint(name) {
  const response = await authFetch(API_ENDPOINTS.CUSTOMER_SEARCH_NAME_FOR_COMPLAINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to search customer by name",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { searchCustomerByNameForComplaint };
