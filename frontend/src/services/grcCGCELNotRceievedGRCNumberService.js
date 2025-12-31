import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

async function fetchNotReceivedGRCNumbers() {
  const response = await authFetch(
    API_ENDPOINTS.GRC_CGCEL_NOT_RECEIVED_NUMBERS,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw {
      message: data.message,
      resolution: data.resolution,
    };
  }
  return data;
}

export { fetchNotReceivedGRCNumbers };
