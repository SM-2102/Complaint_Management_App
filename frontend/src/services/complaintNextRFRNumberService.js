import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

async function fetchNextRFRNumber() {
  const response = await authFetch(API_ENDPOINTS.COMPLAINT_NEXT_RFR_NUMBER, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
  return data;
}

export { fetchNextRFRNumber };
