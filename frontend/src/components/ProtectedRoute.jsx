import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!user || !allowedRoles.includes(user.role)) {
    console.warn(`Yetkisiz erişim denemesi. Kullanıcı rolü: ${user?.role}, İzin verilen roller: ${allowedRoles}`);
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;