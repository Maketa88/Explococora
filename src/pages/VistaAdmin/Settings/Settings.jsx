import React from 'react';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import { FileEdit, KeyRound, LogOut, ArrowRight, Shield, Bell, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Settings = () => {
  const navigate = useNavigate();

  const handleCerrarSesion = async () => {
    try {
      const cedula = localStorage.getItem("cedula");
      const token = localStorage.getItem("token");
      
      if (cedula && token) {
        // Llamar a la API para cambiar estado antes de cerrar sesión
        await axios.patch('http://localhost:10101/usuarios/cambiar-estado', 
          { nuevoEstado: "inactivo", cedula }, 
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        localStorage.setItem("ultimoEstado", "inactivo");
      }
      
      // Borrar datos de sesión
      localStorage.removeItem("token");
      localStorage.removeItem("cedula");
      localStorage.removeItem("rol");
      navigate("/");
    } catch (error) {
      console.error("Error al cambiar estado al cerrar sesión:", error);
      // Aún así continuar con el cierre de sesión
      localStorage.removeItem("token");
      localStorage.removeItem("cedula");
      localStorage.removeItem("rol");
      navigate("/");
    }
  };

  return (
    <DashboardLayoutAdmin>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Configuración</h1>
          <p className="text-emerald-600">Administra tu perfil y preferencias de administrador</p>
        </div>

        {/* Sección de opciones de usuario */}
        <div className="mb-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-6 border-b border-emerald-100 pb-2">
            <Shield className="inline mr-2 text-emerald-500" size={20} />
            Cuenta de Administrador
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Tarjeta Cambiar Correo */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100">
              <div className="p-5 sm:p-6">
                <div className="mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <FileEdit size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Cambiar Correo</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Actualiza tu dirección de correo electrónico asociada a tu cuenta.</p>
                <button 
                  onClick={() => navigate('/VistaAdmin/CambiarCorreo')} 
                  className="flex items-center text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                >
                  Cambiar Correo
                  <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Tarjeta Cambiar Contraseña */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100">
              <div className="p-5 sm:p-6">
                <div className="mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <KeyRound size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Cambiar Contraseña</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Modifica tu contraseña actual para mejorar la seguridad de tu cuenta.</p>
                <button 
                  onClick={() => navigate('/VistaAdmin/CambiarContraseña')} 
                  className="flex items-center text-white bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                >
                  Cambiar Contraseña
                  <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de seguridad y acceso */}
        <div className="mb-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-6 border-b border-emerald-100 pb-2">
            <Shield className="inline mr-2 text-emerald-500" size={20} />
            Seguridad y Acceso
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Tarjeta para notificaciones */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100">
              <div className="p-5 sm:p-6">
                <div className="mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <Bell size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Notificaciones</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Gestiona las notificaciones del sistema y alertas administrativas.</p>
                <button 
                  onClick={() => navigate('/VistaAdmin/Notificaciones')} 
                  className="flex items-center text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                >
                  Configurar Notificaciones
                  <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Tarjeta para cerrar sesión */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100">
              <div className="p-5 sm:p-6">
                <div className="mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <LogOut size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Cerrar Sesión</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Cierra tu sesión actual para proteger la seguridad de tu cuenta.</p>
                <button 
                  onClick={handleCerrarSesion} 
                  className="flex items-center text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                >
                  Cerrar Sesión
                  <ExternalLink size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutAdmin>
  );
};

export default Settings; 