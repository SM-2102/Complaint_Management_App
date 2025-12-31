import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Create a new user (protected route)
 * @param stockData
 * @returns {Promise<void>} Throws on error
 */
async function updateCGCELStock(stockData) {
  const response = await authFetch(API_ENDPOINTS.STOCK_CGCEL_UPDATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stockData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
}

export { updateCGCELStock };
