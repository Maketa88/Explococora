import React from "react";

import { MailIcon } from "@heroicons/react/outline";
import {PasswordField} from "./Password";
import Inicio from "../../assets/Images/inicio.png";

export const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
      <div className="bg-white shadow-2xl rounded-lg p-6 w-full max-w-md border border-gray-200">
        {/* Imagen centrada */}
        <div className="flex justify-center mb-6">
          <img
            src={Inicio}// Aquí puedes colocar la URL de la imagen del Valle del Cocora
            alt="Valle del Cocora"
            className="w-24 h-24 rounded-sm object-cover"
          />
        </div>

        {/* Título */}
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-4">
          Bienvenido a Explococora
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Inicia sesión para explorar las maravillas del Valle del Cocora.
        </p>

        {/* Formulario */}
        <form>
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
                <MailIcon className="h-5 w-5 text-gray-400" />
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

          {/* Botón de inicio de sesión */}
          <button
            type="submit"
            className="w-full bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Enlace para registrarse */}
        <p className="mt-6 text-center text-gray-600">
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            className="text-green-400 font-bold hover:underline"
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
};
