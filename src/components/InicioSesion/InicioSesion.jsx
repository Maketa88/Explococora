import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { HookContrasenia } from "../../hooks/HookContrasenia";
import { IconoExplo } from "./IconoExplo";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export const InicioSesion = () => {
  const { t, i18n } = useTranslation();
  const { login, errorMessage, loading } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', contrasenia: '' });

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
          {t('bienvenidoExplococora')}
        </h2>
        <p className="text-center text-gray-600 mb-4">
          {t('iniciaSesion')}
        </p>
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
        </form>
        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
        <p className="mt-3 text-center text-gray-600">
          {t('noTienesCuenta')} <a
            href="/Registro"
            className="text-green-400 font-bold hover:underline"
          >
            {t('aqui')}
          </a>
        </p>
      </div>
    </div>
  );
};
