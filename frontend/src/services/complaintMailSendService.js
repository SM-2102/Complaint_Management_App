import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Update a warranty record (PATCH)
 * @param {object} mailData - Data to update
 * @returns {Promise<object>} Response data
 */
async function complaintSendEmail(mailData) {
  const url = `${API_ENDPOINTS.COMPLAINT_SEND_EMAIL}`;
  const response = await authFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mailData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to send emails",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { complaintSendEmail };
