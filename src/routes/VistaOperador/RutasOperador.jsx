import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../../pages/VistaOperador/Dashboard/Dashboard';
import Analytics from '../../pages/VistaOperador/Analytics/Analytics';
import Reports from '../../pages/VistaOperador/Reports/Reports';
import Customers from '../../pages/VistaOperador/Customers/Customers';
import NewCustomer from '../../pages/VistaOperador/Customers/NewCustomer';
import VerifiedCustomers from '../../pages/VistaOperador/Customers/VerifiedCustomers';
import Products from '../../pages/VistaOperador/Products/Products';
import NewProduct from '../../pages/VistaOperador/Products/NewProduct';
import Inventory from '../../pages/VistaOperador/Products/Inventory';
import Settings from '../../pages/VistaOperador/Settings/Settings';

const RutasOperador = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/new-customer" element={<NewCustomer />} />
      <Route path="/verified-customers" element={<VerifiedCustomers />} />
      <Route path="/products" element={<Products />} />
      <Route path="/new-product" element={<NewProduct />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default RutasOperador; 