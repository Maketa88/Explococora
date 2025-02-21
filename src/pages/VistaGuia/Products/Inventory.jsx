import React from 'react';
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';

const Inventory = () => {
  return (
    <DashboardLayoutGuia>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        {/* Contenido específico de Inventory */}
      </div>
    </DashboardLayoutGuia>
  );
};

export default Inventory; 