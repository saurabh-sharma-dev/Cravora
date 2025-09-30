// src/components/AdminProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children, element }) => {
  const token = localStorage.getItem("adminToken");

  // ✅ If no token → redirect to login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Optional: You could decode token here and check expiry
  // e.g., using jwt-decode library:
  // const decoded = jwtDecode(token);
  // if (decoded.exp * 1000 < Date.now()) return <Navigate to="/admin/login" replace />;

  // ✅ Support both children and element usage
  return children || element;
};

export default React.memo(AdminProtectedRoute);
