import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);


  console.log('=== ADMIN ROUTE CHECK ===');
  console.log('Token exists:', !!token);
  console.log('User data:', user);
  console.log('User role:', user?.role);
  console.log('Is admin:', user?.role = 'admin');


  // no login
  if (!token || !user) {
    console.log('Not logged in - redirecting to login');
    return <Navigate to="/login" replace />;
   }

   // if not admin 

   if (user.role !== 'admin') {
    console.Console(`Access denied - user role is '${user.role}', not 'admin'`);
    return <Navigate to="/dashboard" replace />;
   }

   // if admin access

   console.log('Admin access granted!');
   return children;

}; 


export default AdminRoute;