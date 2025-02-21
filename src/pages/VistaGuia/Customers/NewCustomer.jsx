import React from 'react';
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';

const NewCustomer = () => {
  return (
    <DashboardLayoutGuia>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">New Customer</h1>
        {/* Contenido específico de New Customer */}
      </div>
    </DashboardLayoutGuia>
  );
};

export default NewCustomer; 