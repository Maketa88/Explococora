import React from 'react';
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';

const NewProduct = () => {
  return (
    <DashboardLayoutGuia>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">New Product</h1>
        {/* Contenido específico de New Product */}
      </div>
    </DashboardLayoutGuia>
  );
};

export default NewProduct; 