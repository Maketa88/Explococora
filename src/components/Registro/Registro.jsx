import React from "react";
import { Login } from "../InicioSesion/InicioSesion";


export const Register = () => {
  const handleRegister = (event) => {
    event.preventDefault();
    // Lógica para registrar
    console.log("Registro");
  };

  return (
    <Login
      title="Regístrate en Explococora"
      subtitle="Crea una cuenta para comenzar a explorar."
      buttonText="Registrarse"
      linkText="¿Ya tienes cuenta? Inicia sesión aquí"
      linkHref="/Ingreso"
      onSubmit={handleRegister}
    />
  );
};
