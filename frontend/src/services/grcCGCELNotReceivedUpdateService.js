import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Update a warranty record (PATCH)
 * @param {object} grcData - Data to update
 * @returns {Promise<object>} Response data
 */
async function receiveGRCSpare(grcData) {
  const url = `${API_ENDPOINTS.GRC_CGCEL_UPDATE_RECEIVE}`;
  const response = await authFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(grcData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update GRC receive",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { receiveGRCSpare };
