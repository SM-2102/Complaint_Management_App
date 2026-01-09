import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Update a customer record (PATCH)
 * @param {string} code - Customer code (max 5 chars, e.g., C1234)
 * @param {object} customerData - Data to update (address, city, pin, contact1, contact2, gst, remark)
 * @returns {Promise<object>} Response data
 */
async function updateCustomer(code, customerData) {
  if (!code) throw new Error("Enter customer code");
  const url = `${API_ENDPOINTS.CUSTOMER_UPDATE}${code}`;
  const response = await authFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customerData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update customer",
      resolution: data.resolution || "",
    };
  }
  return data;
}

export { updateCustomer };
