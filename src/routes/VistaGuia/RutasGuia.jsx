import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../../pages/VistaGuia/Dashboard/Dashboard';
import Analytics from '../../pages/VistaGuia/Analytics/Analytics';
import Reports from '../../pages/VistaGuia/Reports/Reports';
import Customers from '../../pages/VistaGuia/Customers/Customers';
import NewCustomer from '../../pages/VistaGuia/Customers/NewCustomer';
import VerifiedCustomers from '../../pages/VistaGuia/Customers/VerifiedCustomers';
import Products from '../../pages/VistaGuia/Products/Products';
import NewProduct from '../../pages/VistaGuia/Products/NewProduct';
import Inventory from '../../pages/VistaGuia/Products/Inventory';
import Settings from '../../pages/VistaGuia/Settings/Settings';

// ... existing code ...

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