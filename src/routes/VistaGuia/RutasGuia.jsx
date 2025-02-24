import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

// ... existing code ...

const RutasGuia = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/RutasAsignadas" element={<RutasAsignadas />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/new-customer" element={<NewCustomer />} />
      <Route path="/verified-customers" element={<VerifiedCustomers />} />
      <Route path="/products" element={<Products />} />
      <Route path="/new-product" element={<NewProduct />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/VisualizarRutas" element={<VisualizarRutas />} />
      <Route path="/PerfilGuia" element={<PerfilGuia />} />
      <Route path="/CambioEstado" element={<CambioEstado />} />
    </Routes>
  );
};

export default RutasGuia; 