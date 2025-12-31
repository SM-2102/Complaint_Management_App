import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";
/**
 * Update a warranty record (PATCH)
 * @param {object} indentData - Data to update
 * @returns {Promise<object>} Response data
 */
async function generateCGCELIndent(indentData) {
  const url = `${API_ENDPOINTS.STOCK_CGCEL_GENERATE_INDENT}`;
  const response = await authFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(indentData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update indent record",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { generateCGCELIndent };
