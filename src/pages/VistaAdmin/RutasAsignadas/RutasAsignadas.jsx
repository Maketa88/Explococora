import React from 'react';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';

const RutasAsignadas = () => {
  return (
    <DashboardLayoutAdmin>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">RutasAsignadas</h1>
        <h3 className="font-bold text-white">No tienes Rutas Asignadas En este momento</h3>
        {/* Contenido específico de Reports */}
      </div>
    </DashboardLayoutAdmin>
  );
};

export default RutasAsignadas; 