import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../../pages/VistaOperador/Dashboard/Dashboard';
import Rutas from '../../pages/VistaOperador/Rutas/Rutas';
import GestionPaquetes from '../../pages/VistaOperador/Rutas/GestionPaquetes';
import Reports from '../../pages/VistaOperador/Reports/Reports';
import Guias from '../../pages/VistaOperador/Guias/Guias';
import NuevoGuia from '../../pages/VistaOperador/Guias/NuevoGuia';
import Products from '../../pages/VistaOperador/Products/Products';
import NewProduct from '../../pages/VistaOperador/Products/NewProduct';
import Inventory from '../../pages/VistaOperador/Products/Inventory';
import Settings from '../../pages/VistaOperador/Settings/Settings'; // Página de Configuración
import PerfilOperador from '../../pages/VistaOperador/Perfil/PerfilOperador';
import ActualizarPerfil from '../../pages/VistaOperador/Perfil/ActualizarPerfil';
import CambiarContrasena from '../../pages/VistaOperador/Perfil/CambiarContrasena';
// Importar los nuevos componentes de informes
import PagoRutas from '../../pages/VistaOperador/Informes/PagoRutas';
import PagoPaquetes from '../../pages/VistaOperador/Informes/PagoPaquetes';
import Reservas from '../../pages/VistaOperador/Informes/Reservas';
import Caballos from '../../pages/VistaOperador/GestionCaballos/Caballos';
import Plantilla from '../../pages/VistaOperador/Plantilla/Plantilla';

const RutasOperador = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/Rutas" element={<Rutas />} />
      <Route path="/gestion-paquetes" element={<GestionPaquetes />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/guias" element={<Guias />} />
      <Route path="/nuevo-guia" element={<NuevoGuia />} />
      <Route path="/products" element={<Products />} />
      <Route path="/new-product" element={<NewProduct />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/settings" element={<Settings />} /> {/* Ruta de Configuración */}
      <Route path="/perfil" element={<PerfilOperador />} />
      <Route path="/perfil/actualizar" element={<ActualizarPerfil />} />
      <Route path="/perfil/cambiar-contrasena" element={<CambiarContrasena />} />
      {/* Nuevas rutas para los informes */}
      <Route path="/pago-rutas" element={<PagoRutas />} />
      <Route path="/pago-paquetes" element={<PagoPaquetes />} />
      <Route path="/reservas" element={<Reservas />} />
      <Route path="/gestion-caballos" element={<Caballos />} />
      <Route path="/plantilla" element={<Plantilla />} />
    </Routes>
  );
};

export default RutasOperador; 