import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";  // Importamos useLocation
import { PaginaInicio } from "../../pages/PaginaInicio/PaginaInicio";
import { Carta } from "../../components/HistoriaCultura/Body/HistoriaCultura";
import { Login } from "../../components/InicioSesion/InicioSesion";
import { Header } from "../../components/PaginaInicio/Header/Header"; // Asegúrate de importar el Header

export const RutasExplococora = () => {
  const location = useLocation(); // Obtén la ruta actual

  // Verifica si la ruta actual es la de inicio de sesión
  const isLoginPage = location.pathname === "/Ingreso"; // Si la ruta es /Ingreso, no mostramos el Header

  return (
    <div>
      {/* Si no es la página de inicio de sesión, mostramos el Header */}
      {!isLoginPage && <Header />}

      {/* Definimos las rutas */}
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/Historia" element={<Carta />} />
        <Route path="/Ingreso" element={<Login />} />
      </Routes>
    </div>
  );
};
