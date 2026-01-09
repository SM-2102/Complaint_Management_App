import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

/**
 * Upload a CSV file (protected route)
 * @param {File} file - CSV file to upload
 * @returns {Promise<object>} returns parsed response or throws on error
 */
async function UploadComplaints(file) {
  if (!file) {
    throw {
      message: "No file provided",
      resolution: "Select a .csv file to upload",
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await authFetch(API_ENDPOINTS.COMPLAINT_UPLOAD, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message || "Upload failed",
      resolution: data.resolution || "Try again or contact support",
      type: data.type || "error",
    };
  }

  return data;
}

export { UploadComplaints };
