import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a new user (protected route)
 * @param grcData
 * @returns {Promise<void>} Throws on error
 */
async function updateCGCELReturnFinalize(grcData) {
  const response = await authFetch(API_ENDPOINTS.GRC_CGCEL_FINALIZE_RETURN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(grcData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { updateCGCELReturnFinalize };
