// Explococora/src/App.jsx
import React from "react";
import { AuthProvider } from './context/AuthContext';
import { Routes, Route } from "react-router-dom";
import { PaginaInicio } from "./pages/PaginaInicio/PaginaInicio";
import { HistoriaCultura } from "./components/HistoriaCultura/Body/HistoriaCultura";
import { InicioSesion } from "./components/InicioSesion/InicioSesion";
import { Header } from "./components/PaginaInicio/Header/Header";
import { Registro } from "./components/Registro/Registro";
import { PaginaNoEncontrada } from "./components/HistoriaCultura/Body/PaginanoEncontrada/paginaNoEncontrada";
import ContactForm from "./components/ContactForm/ContactForm";
import { NuestrosGuias } from "./components/NuestrosGuias/NuestrosGuias";
import { Footer } from "./components/PaginaInicio/Footer/Footer";
import VistaAdmin from "./pages/VistaAdmin/VistaAdmin";
import VistaGuia from "./pages/VistaGuia/VistaGuia";
import VistaOperador from "./pages/VistaOperador/VistaOperador";
import Chatbot from "./components/Chatbot/Chatbot";

const App = () => {
  return (
    <AuthProvider>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<PaginaInicio />} />
          <Route path="/Historia" element={<HistoriaCultura />} />
          <Route path="/NuestrosGuias" element={<NuestrosGuias />} />
          <Route path="/Ingreso" element={<InicioSesion />} />
          <Route path="/Registro" element={<Registro />} />
          <Route path="/ContactForm" element={<ContactForm />} />
          <Route path="/VistaAdmin" element={<VistaAdmin />} />
          <Route path="/VistaGuia" element={<VistaGuia />} />
          <Route path="/VistaOperador" element={<VistaOperador />} />
          <Route path="/*" element={<PaginaNoEncontrada />} />
        </Routes>
        <Footer />
        <Chatbot />
      </div>
    </AuthProvider>
  );
};

export default App;