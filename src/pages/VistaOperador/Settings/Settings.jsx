import React from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { User, FileEdit, KeyRound, LogOut, ArrowRight, Shield, Bell, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
          <p className="text-teal-300">Administra tu perfil y preferencias</p>
        </div>

        {/* Sección de opciones de usuario */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6 border-b border-teal-800 pb-2">
            <User className="inline mr-2" size={20} />
            Cuenta de Usuario
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tarjeta Ver Perfil */}
            <div className="group bg-gradient-to-br from-teal-900 to-teal-800 rounded-lg overflow-hidden shadow-lg hover:shadow-teal-700/30 transition-all duration-300 transform hover:-translate-y-1 border border-teal-700">
              <div className="p-6">
                <div className="mb-4 w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white group-hover:bg-teal-500 transition-colors">
                  <User size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ver Perfil</h3>
                <p className="text-teal-200 mb-4">Visualiza la información de tu perfil de usuario y tus datos personales.</p>
                <button 
                  onClick={() => navigate('/VistaOperador/perfil')} 
                  className="flex items-center text-white bg-teal-700 hover:bg-teal-600 px-4 py-2 rounded-lg transition-colors group-hover:bg-teal-500 w-full justify-center"
                >
                  Ver Perfil
                  <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Tarjeta Actualizar Información */}
            <div className="group bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-700/30 transition-all duration-300 transform hover:-translate-y-1 border border-blue-700">
              <div className="p-6">
                <div className="mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white group-hover:bg-blue-500 transition-colors">
                  <FileEdit size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Actualizar Información</h3>
                <p className="text-blue-200 mb-4">Modifica tus datos personales, información de contacto y preferencias.</p>
                <button 
                  onClick={() => navigate('/VistaOperador/perfil/actualizar')} 
                  className="flex items-center text-white bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors group-hover:bg-blue-500 w-full justify-center"
                >
                  Actualizar Datos
                  <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Tarjeta Cambiar Contraseña */}
            <div className="group bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-700/30 transition-all duration-300 transform hover:-translate-y-1 border border-purple-700">
              <div className="p-6">
                <div className="mb-4 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white group-hover:bg-purple-500 transition-colors">
                  <KeyRound size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Cambiar Contraseña</h3>
                <p className="text-purple-200 mb-4">Modifica tu contraseña actual para mejorar la seguridad de tu cuenta.</p>
                <button 
                  onClick={() => navigate('/VistaOperador/perfil/cambiar-contrasena')} 
                  className="flex items-center text-white bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors group-hover:bg-purple-500 w-full justify-center"
                >
                  Cambiar Contraseña
                  <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de seguridad y acceso */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6 border-b border-teal-800 pb-2">
            <Shield className="inline mr-2" size={20} />
            Seguridad y Acceso
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta para notificaciones */}
            <div className="group bg-gradient-to-br from-amber-900 to-amber-800 rounded-lg overflow-hidden shadow-lg hover:shadow-amber-700/30 transition-all duration-300 transform hover:-translate-y-1 border border-amber-700">
              <div className="p-6">
                <div className="mb-4 w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white group-hover:bg-amber-500 transition-colors">
                  <Bell size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Notificaciones</h3>
                <p className="text-amber-200 mb-4">Gestiona tus preferencias de notificación y alertas del sistema.</p>
                <button 
                  onClick={() => navigate('/VistaOperador/notificaciones')} 
                  className="flex items-center text-white bg-amber-700 hover:bg-amber-600 px-4 py-2 rounded-lg transition-colors group-hover:bg-amber-500 w-full justify-center"
                >
                  Configurar Notificaciones
                  <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Tarjeta para cerrar sesión */}
            <div className="group bg-gradient-to-br from-rose-900 to-rose-800 rounded-lg overflow-hidden shadow-lg hover:shadow-rose-700/30 transition-all duration-300 transform hover:-translate-y-1 border border-rose-700">
              <div className="p-6">
                <div className="mb-4 w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center text-white group-hover:bg-rose-500 transition-colors">
                  <LogOut size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Cerrar Sesión</h3>
                <p className="text-rose-200 mb-4">Cierra tu sesión actual para proteger la seguridad de tu cuenta.</p>
                <button 
                  onClick={handleCerrarSesion} 
                  className="flex items-center text-white bg-rose-700 hover:bg-rose-600 px-4 py-2 rounded-lg transition-colors group-hover:bg-rose-500 w-full justify-center"
                >
                  Cerrar Sesión
                  <ExternalLink size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la aplicación */}
        <div className="mt-8 p-4 bg-teal-900 bg-opacity-50 rounded-lg border border-teal-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div>
              <h3 className="text-teal-300 font-semibold">Explococora</h3>
              <p className="text-gray-400 text-sm">Versión 1.0.0</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm text-center md:text-right">© 2024 Explococora. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings; 