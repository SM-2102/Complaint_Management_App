import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a new customer (protected route)
 * @param {object} customerData
 * @returns {Promise<void>} Throws on error
 */
async function createCustomer(customerData) {
  const response = await authFetch(API_ENDPOINTS.CUSTOMER_CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customerData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { createCustomer };
