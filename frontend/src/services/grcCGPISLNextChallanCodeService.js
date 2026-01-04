import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

async function fetchNextCGPISLGRCChallanCode() {
  const response = await authFetch(API_ENDPOINTS.GRC_CGPISL_NEXT_CHALLAN_CODE, {
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

export { fetchNextCGPISLGRCChallanCode };
