import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../../pages/VistaGuia/Dashboard/Dashboard';
import VisualizarRutas from '../../pages/VistaGuia/VisualizarRutas/VisualizarRutas';
import RutasAsignadas from '../../pages/VistaGuia/RutasAsignadas/RutasAsignadas';
import Customers from '../../pages/VistaGuia/Customers/Customers';
import NewCustomer from '../../pages/VistaGuia/Customers/NewCustomer';
import VerifiedCustomers from '../../pages/VistaGuia/Customers/VerifiedCustomers';
import Products from '../../pages/VistaGuia/Products/Products';
import NewProduct from '../../pages/VistaGuia/Products/NewProduct';
import Inventory from '../../pages/VistaGuia/Products/Inventory';
import Settings from '../../pages/VistaGuia/Settings/Settings';
import PerfilGuia from '../../pages/VistaGuia/PerfilGuia/PerfilGuia';
import CambioEstado from '../../pages/VistaGuia/CambioEstado/CambioEstado';
import CambiarContraseña from '../../pages/VistaGuia/PerfilGuia/cambiarContra';
import ActualizarGuia from '../../pages/VistaGuia/PerfilGuia/ActualizarGuia';
import EliminarCuentaGuia from '../../pages/VistaGuia/PerfilGuia/EliminarCuentaGuia';

const RutasGuia = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/VistaGuia/PerfilGuia" replace />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/RutasAsignadas" element={<RutasAsignadas />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/new-customer" element={<NewCustomer />} />
      <Route path="/verified-customers" element={<VerifiedCustomers />} />
      <Route path="/products" element={<Products />} />
      <Route path="/new-product" element={<NewProduct />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/VisualizarRutas" element={<VisualizarRutas />} />
      <Route path="/CambioEstado" element={<CambioEstado />} />
      <Route path="/CambiarContraseña" element={<CambiarContraseña />} />
      <Route path="/PerfilGuia" element={<PerfilGuia />} />
      <Route path="/ActualizarGuia" element={<ActualizarGuia />} />
      <Route path="/EliminarCuentaGuia" element={<EliminarCuentaGuia />} />
    </Routes>
  );
};

export default RutasGuia; 