import API_ENDPOINTS from "../config/api";

/**
 * Fetches the CGCEL stock list for a specific division.
 * @param {string} division - The division name to filter by.
 * @returns {Promise<any>} - The API response.
 */
async function fetchNotReceivedGRCDetails(grc_number) {
  if (!grc_number) throw new Error("GRC Number is required");
  const url = `${API_ENDPOINTS.GRC_CGCEL_NOT_RECEIVED_BY_GRC_NUMBER}/${encodeURIComponent(grc_number)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch for GRC Number: ${grc_number}`);
  }
  return response.json();
}

export { fetchNotReceivedGRCDetails };
