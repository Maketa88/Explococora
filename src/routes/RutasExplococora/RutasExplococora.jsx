import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { PaginaInicio } from "../../pages/PaginaInicio/PaginaInicio";
import { HistoriaCultura } from "../../components/HistoriaCultura/Body/HistoriaCultura";
import { InicioSesion } from "../../components/InicioSesion/InicioSesion";
import { Header } from "../../components/PaginaInicio/Header/Header";
import { Registro } from "../../components/Registro/Registro";
import { PaginaNoEncontrada } from "../../components/HistoriaCultura/Body/PaginanoEncontrada/paginaNoEncontrada";
import ContactForm from "../../components/ContactForm/ContactForm";
import  { NuestrosGuias }  from "../../components/NuestrosGuias/NuestrosGuias";
import Footer from "../../components/PaginaInicio/Footer/Footer";




export const RutasExplococora = () => {
  const location = useLocation(); // Obtén la ruta actual

  // Verifica si estamos en una ruta donde el Header no debe mostrarse
  const hideHeader = ["/Ingreso", "/Registro"].includes(location.pathname);

  return (
    <div>
      {/* Mostramos el Header solo si no estamos en las rutas de inicio de sesión o registro */}
      {!hideHeader && <Header />}

      {/* Definimos las rutas */}
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/Historia" element={<HistoriaCultura />} />
        <Route path="/NuestrosGuias" element={<NuestrosGuias />} />
        <Route path="/Ingreso" element={<InicioSesion />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/ContactForm" element={<ContactForm />} />
        <Route path="/*" element={<PaginaNoEncontrada />} />
      </Routes>
      {!hideHeader && <Footer />}

      
    </div>
  );
};
