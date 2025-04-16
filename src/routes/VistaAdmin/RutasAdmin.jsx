import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../../pages/VistaAdmin/Dashboard/Dashboard';
import VisualizarRutas from '../../pages/VistaAdmin/VisualizarRutas/VisualizarRutas';
import VerifiedCustomers from '../../pages/VistaAdmin/Customers/VerifiedCustomers';
import Settings from '../../pages/VistaAdmin/Settings/Settings';
import CambioEstado from '../../pages/VistaAdmin/CambioEstado/CambioEstado';
import CambiarContraseñaAdmin from '../../pages/VistaAdmin/PerfilAdmin/CambiarContraseñaAdmin';
import ActualizarCorreoAdmin from '../../pages/VistaAdmin/PerfilAdmin/ActualizarCorreoAdmin';
import PerfilAdmin from '../../pages/VistaAdmin/PerfilAdmin/PerfilAdmin';
import GestionGuias from '../../pages/VistaAdmin/GestionUsuarios/GestionGuias';
import GestionOperadores from '../../pages/VistaAdmin/GestionUsuarios/GestionOperadores';
import GestionPaquetes from '../../pages/VistaAdmin/GestionPaquetes/GestionPaquetes';
import EliminarPaquetes from '../../pages/VistaAdmin/GestionPaquetes/EliminarPaquetes';
import ActualizarPaquetes from '../../pages/VistaAdmin/GestionPaquetes/ActualizarPaquetes';
import CrearPaquetes from '../../pages/VistaAdmin/GestionPaquetes/CrearPaquetes';
import PagoPaquete from '../../pages/VistaAdmin/Informes/PagoPaquete';
import Reserva from '../../pages/VistaAdmin/Informes/Reserva';
import PagoRuta from '../../pages/VistaAdmin/Informes/PagoRuta';
import EstadoGuia from '../../pages/VistaAdmin/GestionUsuarios/EstadoGuia';
import GestionCaballos from '../../pages/VistaAdmin/Caballos/GestionCaballos';
import GestionPlantillas from '../../pages/VistaAdmin/Plantillas/GestionPlantillas';

const RutasAdmin = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/VistaAdmin/Dashboard" replace />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/VerifiedCustomers" element={<VerifiedCustomers />} />
      <Route path="/Settings" element={<Settings />} />
      <Route path="/Gestionrutas" element={<VisualizarRutas />} />
      <Route path="/CambioEstado" element={<CambioEstado />} />
      <Route path="/CambiarContraseña" element={<CambiarContraseñaAdmin />} />
      <Route path="/PerfilAdmin" element={<PerfilAdmin />} />
      <Route path="/ActualizarCorreo" element={<ActualizarCorreoAdmin />} />
      <Route path="/GestionGuias" element={<GestionGuias />} />
      <Route path="/GestionOperadores" element={<GestionOperadores />} />
      <Route path="/GestionPaquetes" element={<GestionPaquetes />} />
      <Route path="/EliminarPaquetes" element={<EliminarPaquetes />} />
      <Route path="/ActualizarPaquetes" element={<ActualizarPaquetes />} />
      <Route path="/CrearPaquetes" element={<CrearPaquetes />} />
      <Route path="/PagoPaquete" element={<PagoPaquete />} />
      <Route path="/Reserva" element={<Reserva />} />
      <Route path="/PagoRuta" element={<PagoRuta />} />
      <Route path="/EstadoGuia" element={<EstadoGuia />} />
      <Route path="/GestionCaballos" element={<GestionCaballos />} />
      <Route path="/GestionPlantillas" element={<GestionPlantillas />} />
    </Routes>
  );
};

export default RutasAdmin;