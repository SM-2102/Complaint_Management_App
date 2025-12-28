import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import API_ENDPOINTS from "../config/api";
import { authFetch } from "../services/authFetchService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true/false = known
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Call this on 401 or logout
  const handleUnauthorized = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    // Navigation should be handled in the component after calling this
  }, []);

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(
        API_ENDPOINTS.AUTH_ME,
        {},
        handleUnauthorized,
      );
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setUser(data.user || data);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, [handleUnauthorized]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    isAuthenticated,
    user,
    loading,
    checkAuth,
    setIsAuthenticated,
    setUser,
    handleUnauthorized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
