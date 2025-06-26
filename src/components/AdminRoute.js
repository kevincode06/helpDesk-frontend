// src/routes/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// Example: assume the token is stored in localStorage and contains user role info
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // If not logged in
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  // If not an admin
  if (user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // If admin
  return children;
};

export default AdminRoute;
