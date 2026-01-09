import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a new complaint (protected route)
 * @param {object} complaintData
 * @returns {Promise<void>} Throws on error
 */
async function createComplaint(complaintData, entryType) {
  // Send entryType as a query parameter because backend route expects it
  // as a separate parameter (not in the JSON body).
  const url = `${API_ENDPOINTS.COMPLAINT_CREATE}?entryType=${encodeURIComponent(entryType || "")}`;
  const response = await authFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(complaintData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { createComplaint };
