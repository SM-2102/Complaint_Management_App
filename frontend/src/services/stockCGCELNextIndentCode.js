import { authFetch } from "./authFetchService";
import API_ENDPOINTS from "../config/api";

async function fetchNextCGCELIndentCode() {
  const response = await authFetch(API_ENDPOINTS.STOCK_CGCEL_NEXT_INDENT_CODE, {
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

export { fetchNextCGCELIndentCode };
