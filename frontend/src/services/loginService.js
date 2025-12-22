import API_ENDPOINTS from "../config/api";

/**
 * Login user with credentials. Relies on backend to set HTTP-only cookie.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ success: boolean, message?: string }>} Result of login
 */
async function login(username, password) {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: send/receive cookies
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json().catch(() => ({}));
      // Prefer message and resolution from backend, fallback to detail
      return {
        success: false,
        message: data.message || data.detail || "Login failed",
        resolution: data.resolution || "",
      };
    }
  } catch (error) {
    return { success: false, message: error.message || "Network error" };
  }
}

export { login };
