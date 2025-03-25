import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { HookContrasenia } from "../../hooks/HookContrasenia";
import { IconoExplo } from "./IconoExplo";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export const InicioSesion = () => {
  const { t, i18n } = useTranslation();
  const { login, errorMessage, loading } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', contrasenia: '' });
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  const [emailRecuperacion, setEmailRecuperacion] = useState('');
  const [cedulaRecuperacion, setCedulaRecuperacion] = useState('');
  const [estadoRecuperacion, setEstadoRecuperacion] = useState({ mensaje: '', error: false });
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);

  const cambiarIdioma = () => {
    const nuevoIdioma = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nuevoIdioma);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(credentials);
  };
  
  const solicitarRecuperacion = async (e) => {
    e.preventDefault();
    
    if (!emailRecuperacion) {
      setEstadoRecuperacion({ 
        mensaje: 'Por favor, ingresa tu correo electrónico', 
        error: true 
      });
      return;
    }
    
    setEnviandoRecuperacion(true);
    setEstadoRecuperacion({ mensaje: '', error: false });
    
    try {
      // El nuevo endpoint ya no necesita ID en la URL
      const response = await axios.post('http://localhost:10101/enviar-correo', {
        email: emailRecuperacion
      });
      
      setEstadoRecuperacion({
        mensaje: 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña',
        error: false
      });
      
      // Limpiar campo de email
      setEmailRecuperacion('');
      setCedulaRecuperacion('');
    } catch (error) {
      console.error('Error al solicitar recuperación:', error);
      setEstadoRecuperacion({
        mensaje: error.response?.data?.message || 'Error al solicitar recuperación. Verifica tus datos.',
        error: true
      });
    } finally {
      setEnviandoRecuperacion(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
      <div className="bg-white shadow-2xl rounded-lg p-5 w-full max-w-lg border border-gray-200">
        {/* Selector de idioma */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={cambiarIdioma} 
              className={`transition-opacity ${i18n.language === 'es' ? 'opacity-100' : 'opacity-50'}`}
            >
            </button>
          </div>
        </div>

        <IconoExplo />
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-2">
          {mostrarRecuperacion ? "Recuperar Contraseña" : t('bienvenidoExplococora')}
        </h2>
        <p className="text-center text-gray-600 mb-4">
          {mostrarRecuperacion 
            ? "Ingresa tu correo electrónico y cédula para recuperar tu contraseña" 
            : t('iniciaSesion')
          }
        </p>
        
        {!mostrarRecuperacion ? (
          // Formulario de inicio de sesión
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('correoElectronico')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Cocora@correo.com"
                  value={credentials.email}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
            </div>
            <HookContrasenia label={t('contrasena')} onChange={handleChange} />
            <button
              type="submit"
              className="w-full bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              disabled={loading}
            >
              {loading ? 'Cargando...' : t('iniciarSesion')}
            </button>
            
            {errorMessage && <p className="text-red-500 text-center mt-2">{errorMessage}</p>}
            
            <div className="mt-3 text-center">
              <button 
                type="button"
                onClick={() => setMostrarRecuperacion(true)}
                className="text-green-500 hover:text-green-700 font-medium text-sm"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            <p className="mt-3 text-center text-gray-600">
              {t('noTienesCuenta')} <a
                href="/Registro"
                className="text-green-400 font-bold hover:underline"
              >
                {t('aqui')}
              </a>
            </p>
          </form>
        ) : (
          // Formulario de recuperación de contraseña
          <form onSubmit={solicitarRecuperacion}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  value={emailRecuperacion}
                  onChange={(e) => setEmailRecuperacion(e.target.value)}
                  placeholder="Ingresa tu correo electrónico"
                  className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Número de cédula
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a3 3 0 100 6 3 3 0 000-6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={cedulaRecuperacion}
                  onChange={(e) => setCedulaRecuperacion(e.target.value)}
                  placeholder="Ingresa tu número de cédula"
                  className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
            </div>
            
            {estadoRecuperacion.mensaje && (
              <div className={`p-3 mb-4 rounded-md ${estadoRecuperacion.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {estadoRecuperacion.mensaje}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 mb-2"
              disabled={enviandoRecuperacion}
            >
              {enviandoRecuperacion ? 'Enviando...' : 'Recuperar contraseña'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setMostrarRecuperacion(false);
                setEstadoRecuperacion({ mensaje: '', error: false });
              }}
              className="w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-300"
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
