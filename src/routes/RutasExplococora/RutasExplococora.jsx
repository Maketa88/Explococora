import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { PaginaInicio } from "../../pages/PaginaInicio/PaginaInicio";
import { HistoriaCultura } from "../../components/HistoriaCultura/Body/HistoriaCultura";
import { InicioSesion } from "../../components/InicioSesion/InicioSesion";
import { Header } from "../../components/PaginaInicio/Header/Header";
import { Registro } from "../../components/Registro/Registro";
import { PaginaNoEncontrada } from "../../components/HistoriaCultura/Body/PaginanoEncontrada/paginaNoEncontrada";
import ContactForm from "../../components/ContactForm/ContactForm";
import { NuestrosGuias } from "../../components/NuestrosGuias/NuestrosGuias";
import { Footer } from "../../components/PaginaInicio/Footer/Footer";
import VistaAdmin from "../../pages/VistaAdmin/VistaAdmin";
import VistaCliente from "../../pages/VistaCliente/VistaCliente";
import VistaOperador from "../../pages/VistaOperador/VistaOperador";
import VistaGuia from "../../pages/VistaGuia/VistaGuia";
import ChatBot from "../../components/Chatbot/Chatbot";
import QuienesSomos from "../../components/QuienesSomos/QuienesSomos";

export const RutasExplococora = () => {
  const location = useLocation();
  const isOperadorRoute = location.pathname.includes('/VistaOperador');
  const isGuiaRoute = location.pathname.includes('/VistaGuia');

  if (isOperadorRoute) {
    return (
      <Routes>
        <Route path="/VistaOperador/*" element={<VistaOperador />} />
      </Routes>
    );
  }

  if (isGuiaRoute) {
    return (
      <Routes>
        <Route path="/VistaGuia/*" element={<VistaGuia />} />
      </Routes>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Header />
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/Historia" element={<HistoriaCultura />} />
        <Route path="/NuestrosGuias" element={<NuestrosGuias />} />
        <Route path="/Ingreso" element={<InicioSesion />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/ContactForm" element={<ContactForm />} />
        <Route path="/QuienesSomos" element={<QuienesSomos />} />
        <Route path="/VistaAdmin" element={<VistaAdmin />} />
        <Route path="/VistaGuia" element={<VistaGuia />} />
        <Route path="/VistaCliente" element={<VistaCliente />} />
        <Route path="/*" element={<PaginaNoEncontrada />} />
      </Routes>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default RutasExplococora;
