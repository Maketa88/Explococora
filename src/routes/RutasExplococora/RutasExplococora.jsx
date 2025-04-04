import { Route, Routes, useLocation } from "react-router-dom";
import AccesoDenegado from "../../components/AccesoDenegado/AccesoDenegado";
import ChatBot from "../../components/chatbot/Chatbot";
import ContactForm from "../../components/ContactForm/ContactForm";
import Feedback from "../../components/Feedback/Feedback";
import { HistoriaCultura } from "../../components/HistoriaCultura/Body/HistoriaCultura";
import { PaginaNoEncontrada } from "../../components/HistoriaCultura/Body/PaginanoEncontrada/paginaNoEncontrada";
import { InicioSesion } from "../../components/InicioSesion/InicioSesion";
import NuestrasRutas from "../../components/NuestrasRutas/NuestrasRutas";
import { NuestrosGuias } from "../../components/NuestrosGuias/NuestrosGuias";
import { Footer } from "../../components/PaginaInicio/Footer/Footer";
import { Header } from "../../components/PaginaInicio/Header/Header";
import GestionPaquetes from "../../components/Paquetes/Paquetes";
import ProtectedRoute from "../../components/ProtectedRoute/ProtectedRoute";
import QuienesSomos from "../../components/QuienesSomos/QuienesSomos";
import RecuperarContrasena from "../../components/RecuperarContrasena/RecuperarContrasena";
import { Registro } from "../../components/Registro/Registro";
import { VerificacionOTP } from '../../components/VerificacionOTP/VerificacionOTP';
import { PaginaInicio } from "../../pages/PaginaInicio/PaginaInicio";
import VistaAdmin from "../../pages/VistaAdmin/VistaAdmin";
import VistaCliente from "../../pages/VistaCliente/VistaCliente";
import VistaGuia from "../../pages/VistaGuia/VistaGuia";
import VistaOperador from "../../pages/VistaOperador/VistaOperador";
import PoliticaPrivacidad from "../../components/PoliticaPrivacidad/PoliticaPrivacidad";

export const RutasExplococora = () => {
  const location = useLocation();
  
  // Verificar si estamos en una ruta de panel de administración
  const isAdminPanel = location.pathname.includes('/VistaAdmin');
  const isGuiaPanel = location.pathname.includes('/VistaGuia');
  const isOperadorPanel = location.pathname.includes('/VistaOperador');
  const isClientePanel = location.pathname.includes('/VistaCliente');
  
  // Si estamos en alguna vista interna, no mostrar el header y footer público
  const isInternalPanel = isAdminPanel || isGuiaPanel || isOperadorPanel || isClientePanel;

  return (
    <div className="min-h-screen">
      {/* Mostrar Header solo si no estamos en un panel interno */}
      {!isInternalPanel && <Header />}
      
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/Historia" element={<HistoriaCultura />} />
        <Route path="/NuestrosGuias" element={<NuestrosGuias />} />
        <Route path="/NuestrasRutas" element={<NuestrasRutas />} />
        <Route path="/NuestrasRutas/:idRuta" element={<NuestrasRutas />} />
        <Route path="/PaquetesTuristicos" element={<GestionPaquetes />} />
        <Route path="/PaquetesTuristicos/:idPaquete" element={<GestionPaquetes />} />
        <Route path="/Ingreso" element={<InicioSesion />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/ContactForm" element={<ContactForm />} />
        <Route path="/QuienesSomos" element={<QuienesSomos />} />
        <Route path="/Feedback" element={<Feedback />} />
        <Route path="/verificar-otp" element={<VerificacionOTP />} />
        <Route path="/acceso-denegado" element={<AccesoDenegado />} />
        <Route path="/recuperar-contrasenia/:token" element={<RecuperarContrasena />} />
        <Route path="/PoliticaPrivacidad" element={<PoliticaPrivacidad />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/VistaAdmin/*" element={<VistaAdmin />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['guia']} />}>
          <Route path="/VistaGuia/*" element={<VistaGuia />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['operador']} />}>
          <Route path="/VistaOperador/*" element={<VistaOperador />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Cliente']} />}>
          <Route path="/VistaCliente/*" element={<VistaCliente />} />
        </Route>

        <Route path="/*" element={<PaginaNoEncontrada />} />
      </Routes>
      
      {/* Mostrar Footer y ChatBot solo si no estamos en un panel interno */}
      {!isInternalPanel && (
        <>
          <Footer />
          <ChatBot />
        </>
      )}
    </div>
  );
};

export default RutasExplococora;