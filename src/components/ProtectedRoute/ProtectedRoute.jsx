import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  
  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    // Guardar la ubicación que intentaba acceder para redireccionar después de login
    return <Navigate to="/Ingreso" state={{ from: location }} replace />;
  }
  
  // Verificar si el usuario tiene el rol adecuado
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/acceso-denegado" replace />;
  }
  
  // Si está autenticado y tiene permisos, renderiza la ruta
  return <Outlet />;
};

export default ProtectedRoute;