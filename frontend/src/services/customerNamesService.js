import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch all customer names for autocomplete
 * @returns {Promise<string[]>} List of customer names
 */
async function fetchCustomerNames() {
  const response = await authFetch(API_ENDPOINTS.CUSTOMER_LIST_NAMES, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch master names");
  return response.json();
}

export { fetchCustomerNames };
