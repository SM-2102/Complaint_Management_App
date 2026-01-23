import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Fetches the CGCEL stock list for a specific division.
 * @param {string} allocated_to - The division name to filter by.
 * @returns {Promise<any>} - The API response.
 */
async function allocatedDataToTechnician(allocated_to) {
  if (!allocated_to) throw new Error("Allocated To is required");
  const url = `${API_ENDPOINTS.COMPLAINT_ALLOCATION_DATA}/${encodeURIComponent(allocated_to)}`;
  const response = await authFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch allocated data: ${allocated_to}`);
  }
  return response.json();
}

export { allocatedDataToTechnician };
