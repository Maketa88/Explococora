import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();
  
  // Esperar mientras se verifica el token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
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