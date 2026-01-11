import API_ENDPOINTS from "../config/api";
/**
 * Wrapper for fetch that handles 401 errors globally and auto-refreshes token.
 * If a 401 is detected, attempts refresh, then retries once. Calls onUnauthorized if still 401.
 */
async function authFetch(url, options = {}, onUnauthorized) {
  // Always send cookies
  const fetchWithCreds = (u, o) => fetch(u, { ...o, credentials: "include" });

  let response = await fetchWithCreds(url, options);
  if (response.status === 401) {
    // Try to refresh token
    const refreshResp = await fetchWithCreds(API_ENDPOINTS.REFRESH_TOKEN, {
      method: "POST",
    });
    if (refreshResp.ok) {
      // Retry original request once
      response = await fetchWithCreds(url, options);
      if (response.status !== 401) {
        return response;
      }
    }
    // Still unauthorized after refresh
    if (typeof onUnauthorized === "function") {
      onUnauthorized();
    }
  }
  return response;
}

export { authFetch };
