import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

/**
 * Calls the CHALLAN_PRINT API with dynamic report type and returns a Blob (PDF) for download.
 * Throws error with { message, resolution } if backend returns error.
 * @param {Object} payload - The payload to send (should include report_type)
 * @returns {Promise<Blob>} PDF blob
 */
async function printGRCReturn(payload) {
  // Extract report_type from payload, default to 'All' if not present
  const reportType = payload.report_type || "All";
  // Remove report_type from payload before sending
  const { report_type, ...restPayload } = payload;
  // Compose the endpoint with report type as path param
  const endpoint = `${API_ENDPOINTS.GRC_CGPISL_REPORT_PRINT}/${reportType}`;
  const response = await authFetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/pdf",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(restPayload),
  });
  if (!response.ok) {
    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      // If not JSON, leave data as empty object
    }
    throw {
      message: data.message || "Failed to print challan.",
      resolution: data.resolution || "",
    };
  }
  // Get PDF blob
  const blob = await response.blob();
  // Open PDF in a new tab
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");
  // Optionally, revoke the object URL after some time
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  return blob;
}

export { printGRCReturn };
