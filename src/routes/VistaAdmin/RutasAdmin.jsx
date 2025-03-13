import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../../pages/VistaAdmin/Dashboard/Dashboard';
import VisualizarRutas from '../../pages/VistaAdmin/VisualizarRutas/VisualizarRutas';
import VerifiedCustomers from '../../pages/VistaAdmin/Customers/VerifiedCustomers';
import Settings from '../../pages/VistaAdmin/Settings/Settings';
import CambioEstado from '../../pages/VistaAdmin/CambioEstado/CambioEstado';
import CambiarContraseñaAdmin from '../../pages/VistaAdmin/PerfilAdmin/CambiarContraseñaAdmin';
import ActualizarCorreoAdmin from '../../pages/VistaAdmin/PerfilAdmin/ActualizarCorreoAdmin';
import EliminarUsuario from '../../pages/VistaAdmin/PerfilAdmin/EliminarUsuario';
import PerfilAdmin from '../../pages/VistaAdmin/PerfilAdmin/PerfilAdmin';
import GestionGuias from '../../pages/VistaAdmin/GestionUsuarios/GestionGuias';
import GestionOperadores from '../../pages/VistaAdmin/GestionUsuarios/GestionOperadores';


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
      <Route path="/EliminarUsuario" element={<EliminarUsuario />} />
      <Route path="/GestionGuias" element={<GestionGuias />} />
      <Route path="/GestionOperadores" element={<GestionOperadores />} />


    </Routes>
  );
};

export default RutasAdmin; 