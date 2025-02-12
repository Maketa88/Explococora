import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

export const HookContrasenia = () => {
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const { t } = useTranslation();

  const toggleMostrarContrasenia = () => {
    setMostrarContrasenia(!mostrarContrasenia);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {t('contrasena')}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-2 text-gray-400">
          <FaLock />
        </span>
        <input
          type={mostrarContrasenia ? "text" : "password"}
          className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="button"
          onClick={toggleMostrarContrasenia}
          className="absolute right-3 top-2 text-gray-400"
        >
          {mostrarContrasenia ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
};
