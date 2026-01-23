import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Fetches the CGCEL stock list for a specific division.
 * @param {string} division - The division name to filter by.
 * @returns {Promise<any>} - The API response.
 */
async function fetchNotReceivedGRCDetails(grc_number) {
  if (!grc_number) throw new Error("GRC Number is required");
  const url = `${API_ENDPOINTS.GRC_CGCEL_NOT_RECEIVED_BY_GRC_NUMBER}/${encodeURIComponent(grc_number)}`;
  const response = await authFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch for GRC Number: ${grc_number}`);
  }
  return response.json();
}

export { fetchNotReceivedGRCDetails };
