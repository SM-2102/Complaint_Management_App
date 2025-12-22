import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PrivateRoute with optional role-based access
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string|string[]} [props.requiredRole] - Role or roles required to access
 */
export default function PrivateRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading || isAuthenticated === null) {
    // Optionally, show a loading spinner
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!user || !roles.includes(user.role)) {
      // Redirect to Menu if user lacks required role
      return <Navigate to="/MenuDashboard" replace />;
    }
  }

  return children;
}
