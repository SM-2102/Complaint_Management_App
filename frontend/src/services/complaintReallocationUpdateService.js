import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a new user (protected route)
 * @param reallocateData
 * @returns {Promise<void>} Throws on error
 */
async function reallocateComplaints(reallocateData) {
  const response = await authFetch(API_ENDPOINTS.COMPLAINT_REALLOCATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reallocateData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { reallocateComplaints };
