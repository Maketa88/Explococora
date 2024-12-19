import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { PaginaInicio } from "../../pages/PaginaInicio/PaginaInicio";
import { Carta } from "../../components/HistoriaCultura/Body/HistoriaCultura";
import { Login } from "../../components/InicioSesion/InicioSesion";
import { Header } from "../../components/PaginaInicio/Header/Header";
import { Register } from "../../components/Registro/Registro";

export const RutasExplococora = () => {
  const location = useLocation(); // Obtén la ruta actual

  // Verifica si estamos en una ruta donde el Header no debe mostrarse
  const hideHeader = ["/Ingreso", "/register"].includes(location.pathname);

  return (
    <div>
      {/* Mostramos el Header solo si no estamos en las rutas de inicio de sesión o registro */}
      {!hideHeader && <Header />}

      {/* Definimos las rutas */}
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/Historia" element={<Carta />} />
        <Route path="/Ingreso" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};
