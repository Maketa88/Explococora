import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../../pages/VistaOperador/Dashboard/Dashboard';
import Rutas from '../../pages/VistaOperador/Rutas/Rutas';
import Reports from '../../pages/VistaOperador/Reports/Reports';
import Guias from '../../pages/VistaOperador/Guias/Guias';
import NuevoGuia from '../../pages/VistaOperador/Guias/NuevoGuia';
// Comentamos esta importación hasta crear el archivo
// import GuiasVerificados from '../../pages/VistaOperador/Guias/GuiasVerificados';
import Products from '../../pages/VistaOperador/Products/Products';
import NewProduct from '../../pages/VistaOperador/Products/NewProduct';
import Inventory from '../../pages/VistaOperador/Products/Inventory';
import Settings from '../../pages/VistaOperador/Settings/Settings';
import PerfilOperador from '../../pages/VistaOperador/Perfil/PerfilOperador';
import ActualizarPerfil from '../../pages/VistaOperador/Perfil/ActualizarPerfil';
import CambiarContrasena from '../../pages/VistaOperador/Perfil/CambiarContrasena';

const RutasOperador = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/Rutas" element={<Rutas />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/guias" element={<Guias />} />
      <Route path="/nuevo-guia" element={<NuevoGuia />} />
      {/* Comentamos esta ruta hasta tener el componente */}
      {/* <Route path="/guias-verificados" element={<GuiasVerificados />} /> */}
      <Route path="/products" element={<Products />} />
      <Route path="/new-product" element={<NewProduct />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/perfil" element={<PerfilOperador />} />
      <Route path="/perfil/actualizar" element={<ActualizarPerfil />} />
      <Route path="/perfil/cambiar-contrasena" element={<CambiarContrasena />} />
    </Routes>
  );
};

export default RutasOperador; 