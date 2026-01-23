import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Fetches the CGCEL stock list for a specific division.
 * @param {string} product_division - The division name to filter by.
 * @returns {Promise<any>} - The API response.
 */
async function generateRFR(data) {
  const url = `${API_ENDPOINTS.COMPLAINT_GENERATE_RFR}`;
  const response = await authFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body : JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate RFR`);
  }
  return response.json();
}

export { generateRFR };
