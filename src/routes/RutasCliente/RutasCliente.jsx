import React from "react";
import { Routes, Route } from "react-router-dom";

import { HeaderCliente } from "../../pages/VistaCliente/Header/HeaderCliente";
import PerfilCliente from "../../pages/VistaCliente/PerfilCliente";
import { PaginaInicio } from "../../pages/PaginaInicio/PaginaInicio";
import { Footer } from "../../components/PaginaInicio/Footer/Footer";
import ChatBot from "../../components/Chatbot/Chatbot";
import { HistoriaCultura } from "../../components/HistoriaCultura/Body/HistoriaCultura";
import ContactForm from "../../components/ContactForm/ContactForm";
import ActualizarDatosCliente from "../../pages/VistaCliente/ActualizarCliente";
import CambiarContraseña from "../../pages/VistaCliente/CambiarContraseña";







// ... existing code ...

const RutasCliente = () => {
  return (
    <>
      <HeaderCliente />
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/PerfilCliente" element={<PerfilCliente />} />
        <Route path="/Historia" element={<HistoriaCultura />} />
        <Route path="/Contacto" element={<ContactForm />} />
        <Route path="/ActualizarPerfil" element={<ActualizarDatosCliente />} />
        <Route path="/ActualizarContrasenia" element={<CambiarContraseña/>} />
        
      </Routes>
      <Footer />
      <ChatBot />
    </>
  );
};

export default RutasCliente;
