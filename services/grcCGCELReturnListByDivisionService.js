import API_ENDPOINTS from "../config/api";

/**
 * Fetches the CGCEL stock list for a specific division.
 * @param {string} division - The division name to filter by.
 * @returns {Promise<any>} - The API response.
 */
async function grcCGCELListByDivision(division) {
  if (!division) throw new Error("Division is required");
  const url = `${API_ENDPOINTS.GRC_CGCEL_LIST_BY_DIVISION}/${encodeURIComponent(division)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch stock list for division: ${division}`);
  }
  return response.json();
}

export { grcCGCELListByDivision };
