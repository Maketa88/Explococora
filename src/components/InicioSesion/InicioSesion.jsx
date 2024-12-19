import React from "react";
import { FaEnvelope } from "react-icons/fa";
import { PasswordField } from "../../hooks/HooksPassword";
import { IconoExplo } from "./IconoExplo";

export const Login = ({
  title = "Bienvenido a Explococora",
  subtitle = "Inicia sesión para explorar las maravillas del Valle del Cocora.",
  buttonText = "Iniciar Sesión",
  linkText = "¿No tienes cuenta? Regístrate aquí",
  linkHref = "/register",
  onSubmit,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
      <div className="bg-white shadow-2xl rounded-lg p-6 w-full max-w-md border border-gray-200">
        {/* Icono de Explococora */}
        <IconoExplo />

        {/* Título */}
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-4">
          {title}
        </h2>
        <p className="text-center text-gray-600 mb-6">{subtitle}</p>

        {/* Formulario */}
        <form onSubmit={onSubmit}>
          {/* Campo de correo */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="email"
                id="email"
                placeholder="Cocora@correo.com"
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Campo de contraseña */}
          <PasswordField />

          {/* Botón de acción */}
          <button
            type="submit"
            className="w-full bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            {buttonText}
          </button>
        </form>

        {/* Enlace para registrarse/iniciar sesión */}
        <p className="mt-6 text-center text-gray-600">
          {linkText}{" "}
          <a
            href={linkHref}
            className="text-green-400 font-bold hover:underline"
          >
            Aquí
          </a>
        </p>
      </div>
    </div>
  );
};
