import React from "react";
import { IconoExplo } from "./IconoExplo";
import { Input } from "./Input";
import { HookContrasenia } from "../../hooks/HookContrasenia";
import { useTranslation } from 'react-i18next';
import Colombia from "../../assets/Images/Colombia.png";
import Usa from "../../assets/Images/Usa.png";

export const Login = () => {
  const { t, i18n } = useTranslation();

  const cambiarIdioma = () => {
    const nuevoIdioma = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nuevoIdioma);
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
              <img 
                src={Colombia} 
                alt="Bandera de Colombia"
                className="w-8 h-8 object-cover rounded"
              />
            </button>
            <span className="text-gray-500">|</span>
            <button 
              onClick={cambiarIdioma}
              className={`transition-opacity ${i18n.language === 'en' ? 'opacity-100' : 'opacity-50'}`}
            >
              <img 
                src={Usa} 
                alt="USA Flag"
                className="w-8 h-8 object-cover rounded"
              />
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
        <form>
          <Input
            label={t('correoElectronico')}
            type="email"
            placeholder="Cocora@correo.com"
          />
          <HookContrasenia label={t('contrasena')} />
          <button
            type="submit"
            className="w-full bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            {t('iniciarSesion')}
          </button>
        </form>
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