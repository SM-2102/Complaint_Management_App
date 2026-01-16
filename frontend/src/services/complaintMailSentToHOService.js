import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Update a warranty record (PATCH)
 * @param {object} complaintNumbers - Data to update
 * @returns {Promise<object>} Response data
 */
async function complaintSentToHO(complaintNumbers) {
  const url = `${API_ENDPOINTS.COMPLAINT_MAIL_SENT_TO_HO}`;
  const response = await authFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(complaintNumbers),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { complaintSentToHO };