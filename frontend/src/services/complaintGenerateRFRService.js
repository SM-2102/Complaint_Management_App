import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Fetches the CGCEL stock list for a specific division.
 * @param {string} product_division - The division name to filter by.
 * @returns {Promise<any>} - The API response.
 */
async function generateRFR(data) {
  const url = `${API_ENDPOINTS.COMPLAINT_GENERATE_RFR}`;
  // Support sending either a plain object (JSON) or FormData (for file uploads)
  const options = { method: "POST" };
  if (data instanceof FormData) {
    options.body = data;
    // Let fetch set Content-Type for multipart/form-data
  } else {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }
  const response = await authFetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to generate RFR`);
  }
  return response.json();
}

export { generateRFR };
