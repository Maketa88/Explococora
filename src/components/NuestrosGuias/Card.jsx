import React from 'react';

const Card = ({ guia }) => {
  return (
    <div className="card bg-gray-100 rounded-lg shadow-lg overflow-hidden w-80">
      <img src={guia.foto || '/default-avatar.png'} alt="Foto del guía" className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{guia.primerNombre} {guia.primerApellido}</h3>
        <p className="text-sm text-gray-500">{guia.email}</p>
      </div>
    </div>
  );
};

export { Card };
