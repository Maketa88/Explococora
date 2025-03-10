import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ChatBot from "../../components/Chatbot/Chatbot";
import ContactForm from "../../components/ContactForm/ContactForm";
import { HistoriaCultura } from "../../components/HistoriaCultura/Body/HistoriaCultura";
import { PaginaNoEncontrada } from "../../components/HistoriaCultura/Body/PaginanoEncontrada/paginaNoEncontrada";
import { InicioSesion } from "../../components/InicioSesion/InicioSesion";
import { NuestrosGuias } from "../../components/NuestrosGuias/NuestrosGuias";
import { Footer } from "../../components/PaginaInicio/Footer/Footer";
import { Header } from "../../components/PaginaInicio/Header/Header";
import QuienesSomos from "../../components/QuienesSomos/QuienesSomos";
import { Registro } from "../../components/Registro/Registro";
import { PaginaInicio } from "../../pages/PaginaInicio/PaginaInicio";
import VistaAdmin from "../../pages/VistaAdmin/VistaAdmin";
import VistaCliente from "../../pages/VistaCliente/VistaCliente";
import VistaGuia from "../../pages/VistaGuia/VistaGuia";
import VistaOperador from "../../pages/VistaOperador/VistaOperador";
import NuestrasRutas from "../../components/NuestrasRutas/NuestrasRutas";

export const RutasExplococora = () => {
  const location = useLocation();
  const isOperadorRoute = location.pathname.includes("/VistaOperador");
  const isGuiaRoute = location.pathname.includes("/VistaGuia");
  const isClienteRoute = location.pathname.includes("/VistaCliente");
  const isAdminRoute = location.pathname.includes("/VistaAdmin");

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
        <Route
          path="/VistaGuia"
          element={<Navigate to="/VistaGuia/PerfilGuia" replace />}
        />
        <Route path="/VistaGuia/*" element={<VistaGuia />} />
      </Routes>
    );
  }

  if (isClienteRoute) {
    return (
      <Routes>
        <Route path="/VistaCliente/*" element={<VistaCliente />} />
      </Routes>
    );
  }
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/VistaAdmin/*" element={<VistaAdmin />} />
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
        <Route path="/NuestrasRutas" element={<NuestrasRutas />} />
        <Route path="/NuestrasRutas/:idRuta" element={<NuestrasRutas />} />
        <Route path="/Ingreso" element={<InicioSesion />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/ContactForm" element={<ContactForm />} />
        <Route path="/QuienesSomos" element={<QuienesSomos />} />
        <Route path="/*" element={<PaginaNoEncontrada />} />
      </Routes>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default RutasExplococora;

