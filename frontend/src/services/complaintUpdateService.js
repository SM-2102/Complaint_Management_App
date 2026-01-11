import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Update a customer record (PATCH)
 * @param {string} complaintNumber - Customer code (max 5 chars, e.g., C1234)
 * @param {object} complaintData - Data to update (address, city, pin, contact1, contact2, gst, remark)
 * @returns {Promise<object>} Response data
 */
async function updateComplaint(complaintNumber, complaintData) {
  if (!complaintNumber) throw new Error("Enter complaint number");
  const url = `${API_ENDPOINTS.COMPLAINT_UPDATE}/${complaintNumber}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(complaintData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update complaint",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { updateComplaint };
