import API_ENDPOINTS from "../config/api";

async function login(username, password) {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json(); // ❗ DO NOT catch here

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.detail || "Login failed",
        resolution: data.resolution || "",
      };
    }

    // ✅ Preserve backend response
    return {
      success: true,
      ...data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error",
    };
  }
}

export { login };
