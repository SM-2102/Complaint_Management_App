import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a Request for Replacement (RFR) record (PATCH)
 * @param {object} rfrData - Data to update (address, city, pin, contact1, contact2, gst, remark)
 * @returns {Promise<object>} Response data
 */
async function createRFR(rfrData) {
  if (!rfrData.complaint_number) throw new Error("Enter complaint number");
  const url = `${API_ENDPOINTS.COMPLAINT_RFR_CREATE}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rfrData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to create RFR",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { createRFR };
