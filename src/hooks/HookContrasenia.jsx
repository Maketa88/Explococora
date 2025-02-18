import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa"; // Para ojo cerrado
import { useTranslation } from 'react-i18next';

export const HookContrasenia = ({ label, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-6">
      <label
        htmlFor="password"
        className="block text-gray-700 font-medium mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <FaLock className="h-5 w-5 text-gray-400" />
        </span>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="contrasenia" // Asegúrate de que el nombre coincida
          onChange={onChange} // Llama al callback para actualizar el estado en el componente padre
          placeholder="********"
          className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <span
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
        >
          {showPassword ? (
            <FaEye className="h-5 w-5 text-gray-400" />
          ) : (
            <FaEyeSlash className="h-5 w-5 text-gray-400" />
          )}
        </span>
      </div>
    </div>
  );
};
