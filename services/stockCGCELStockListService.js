import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Fetch all master customer names for autocomplete
 * @returns {Promise<string[]>} List of customer names
 */
async function fetchStockCGCELList() {
  const response = await authFetch(API_ENDPOINTS.STOCK_CGCEL_LIST, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch stock CGPISL list");
  return response.json();
}

export { fetchStockCGCELList };
