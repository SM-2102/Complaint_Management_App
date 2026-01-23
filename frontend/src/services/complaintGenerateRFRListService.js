import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Fetches the CGCEL stock list for a specific division.
 * @param {string} product_division - The division name to filter by.
 * @returns {Promise<any>} - The API response.
 */
async function fetchGenerateRFRList(product_division) {
  if (!product_division) throw new Error("Product Division is required");
  const url = `${API_ENDPOINTS.COMPLAINT_GENERATE_RFR_DATA}/${encodeURIComponent(product_division)}`;
  const response = await authFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch allocated data: ${product_division}`);
  }
  return response.json();
}

export { fetchGenerateRFRList };
