import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem("idRol");
  
  if (!allowedRoles.includes(userRole as string)) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

export default ProtectedRoute;