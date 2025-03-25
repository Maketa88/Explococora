import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import ChatBot from "../../components/chatbot/Chatbot";
import ContactForm from "../../components/ContactForm/ContactForm";
import { HistoriaCultura } from "../../components/HistoriaCultura/Body/HistoriaCultura";
import NuestrasRutas from "../../components/NuestrasRutas/NuestrasRutas";
import { NuestrosGuias } from "../../components/NuestrosGuias/NuestrosGuias";
import { ConfirmacionPago, FormularioReservaRuta } from "../../components/PagoRuta";
import { VistaPagoSimulado } from "../../components/PagoRuta/VistaPagoSimulado";
import { PaginaInicio } from "../../pages/PaginaInicio/PaginaInicio";
import ActualizarDatosCliente from "../../pages/VistaCliente/ActualizarCliente";
import { BorrarCuenta } from "../../pages/VistaCliente/BorrarCuenta";
import CambiarContraseña from "../../pages/VistaCliente/CambiarContraseña";
import { FooterCliente } from "../../pages/VistaCliente/Footer/FooterCliente";
import { HeaderCliente } from "../../pages/VistaCliente/Header/HeaderCliente";
import PerfilCliente from "../../pages/VistaCliente/PerfilCliente";
import QuienesSomosCliente from "../../pages/VistaCliente/QuinesSomosCliente";



const RutasCliente = () => {
  const [ocultarFooter, setOcultarFooter] = useState(false);

  useEffect(() => {
    // Función para manejar el evento de ocultar/mostrar footer
    const handleOcultarFooter = (event) => {
      setOcultarFooter(event.detail.ocultar);
    };

    // Agregar el event listener
    window.addEventListener('ocultarFooter', handleOcultarFooter);

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('ocultarFooter', handleOcultarFooter);
    };
  }, []);

  return (
    <>
      <HeaderCliente />
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/PerfilCliente" element={<PerfilCliente />} />
        <Route path="/Historia" element={<HistoriaCultura />} />
        <Route path="/Contacto" element={<ContactForm />} />
        <Route path="/ActualizarPerfil" element={<ActualizarDatosCliente />} />
        <Route path="/ActualizarContrasenia" element={<CambiarContraseña />} />
        <Route path="/EliminarCuenta" element={<BorrarCuenta />} />
        <Route path="/NuestrosGuias" element={<NuestrosGuias />} />
        <Route path="/NuestrasRutas" element={<NuestrasRutas />} />
        <Route path="/NuestrasRutas/:idRuta" element={<NuestrasRutas />} />
        <Route path="/QuienesSomos" element={<QuienesSomosCliente />} />
        
        {/* Rutas para pagos y reservas */}
        <Route path="reserva-ruta/:idRuta" element={<FormularioReservaRuta />} />
        <Route path="reserva/mercado-libre" element={<VistaPagoSimulado />} />
        <Route path="reserva/confirmacion" element={<ConfirmacionPago />} />
        <Route path="reserva/pendiente" element={<ConfirmacionPago />} />
        <Route path="reserva/error" element={<ConfirmacionPago />} />
      </Routes>
      {!ocultarFooter && <FooterCliente />}
      <ChatBot />
    </>
  );
};

export default RutasCliente;
