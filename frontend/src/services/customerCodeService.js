import API_ENDPOINTS from "../config/api";
import { authFetch } from "./authFetchService";

async function getNextCustomerCode() {
  const response = await authFetch(API_ENDPOINTS.CUSTOMER_NEXT_CODE, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch next code");
  }
  const data = await response.json();
  return data.next_code || "";
}

export { getNextCustomerCode };
