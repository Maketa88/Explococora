import React from 'react';
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';
import { User, FileEdit, KeyRound, LogOut, ArrowRight, Shield, Bell, ExternalLink, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <DashboardLayoutGuia>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Configuración</h1>
          <p className="text-emerald-600">Administra tu perfil y preferencias</p>
        </div>

        {/* Sección de opciones de usuario */}
        <div className="mb-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-6 border-b border-emerald-100 pb-2">
            <User className="inline mr-2 text-emerald-500" size={20} />
            Cuenta de Usuario
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Tarjeta Ver Perfil */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100">
              <div className="p-5 sm:p-6">
                <div className="mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <User size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Ver Perfil</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Visualiza la información de tu perfil de usuario y tus datos personales.</p>
                <button 
                  onClick={() => navigate('/VistaGuia/PerfilGuia')} 
                  className="flex items-center text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                >
                  Ver Perfil
                  <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Tarjeta Actualizar Información */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100">
              <div className="p-5 sm:p-6">
                <div className="mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <FileEdit size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Actualizar Información</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Modifica tus datos personales, información de contacto y preferencias.</p>
                <button 
                  onClick={() => navigate('/VistaGuia/ActualizarGuia')} 
                  className="flex items-center text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                >
                  Actualizar Datos
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
                  onClick={() => navigate('/VistaGuia/CambiarContraseña')} 
                  className="flex items-center text-white bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                >
                  Cambiar Contraseña
                  <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Certificados */}
        <div className="mb-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-6 border-b border-emerald-100 pb-2">
            <Award className="inline mr-2 text-emerald-500" size={20} />
            Certificados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Tarjeta Ver Certificados */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-100">
              <div className="p-5 sm:p-6">
                <div className="mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                  <Award size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Mis Certificados</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Visualiza y descarga tus certificados de capacitación y acreditaciones.</p>
                <button 
                  onClick={() => navigate('/VistaGuia/CertificadoGuia')} 
                  className="flex items-center text-white bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg transition-colors w-full justify-center"
                >
                  Ver Certificados
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
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Gestiona tus preferencias de notificación y alertas del sistema.</p>
                <button 
                  onClick={() => navigate('/VistaGuia/notificaciones')} 
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
    </DashboardLayoutGuia>
  );
};

export default Settings; 