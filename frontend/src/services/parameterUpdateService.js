import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Update application parameters (PATCH)
 * Sends FULL parameter object
 * @param {Object} parameters
 * @returns {Promise<object>} Response data
 */
async function updateParameters(parameters) {
  if (!parameters || typeof parameters !== "object" || Object.keys(parameters).length === 0) {
    throw new Error("No parameters to update");
  }

  const response = await authFetch(API_ENDPOINTS.PARAMETER_UPDATE, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parameters),
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      message: data.message || data.detail || "Failed to update parameters",
      resolution: data.resolution || "",
    };
  }

  return data;
}

export { updateParameters };
