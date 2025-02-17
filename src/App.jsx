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
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import GuiaDashboard from "./pages/GuiaDashboard/GuiaDashboard";
import OperadorDashboard from "./pages/OperadorDashboard/OperadorDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Chatbot from "./components/Chatbot/Chatbot"; // Asegúrate de que la ruta sea correcta

const App = () => {
  return (
    <AuthProvider>
      <div>
        <Header />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<PaginaInicio />} />
          <Route path="/Historia" element={<HistoriaCultura />} />
          <Route path="/NuestrosGuias" element={<NuestrosGuias />} />
          <Route path="/Ingreso" element={<InicioSesion />} />
          <Route path="/Registro" element={<Registro />} />
          <Route path="/ContactForm" element={<ContactForm />} />
          
          {/* Rutas protegidas */}
          <Route 
            path="/AdminDashboard/" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/GuiaDashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['guia']}>
                <GuiaDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/OperadorDashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['operador']}>
                <OperadorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Ruta 404 */}
          <Route path="/*" element={<PaginaNoEncontrada />} />
        </Routes>
        <Footer />
        <Chatbot /> {/* Agrega el componente del chatbot aquí */}
      </div>
    </AuthProvider>
  );
};

export default App;