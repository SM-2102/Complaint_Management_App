import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Update a master record (PATCH)
 * @param {string} spare_code - Master code (max 5 chars, e.g., C1234)
 * @param {object} indentData - Data to update (address, city, pin, contact1, contact2, gst, remark)
 * @returns {Promise<object>} Response data
 */
async function createCGCELIndent(spare_code, indentData) {
  if (!spare_code) throw new Error("Enter spare code");
  const url = `${API_ENDPOINTS.STOCK_CGCEL_CREATE_INDENT}/${spare_code}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(indentData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to create indent",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { createCGCELIndent };
