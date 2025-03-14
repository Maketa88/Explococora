import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconoExplo } from '../InicioSesion/IconoExplo';

const AccesoDenegado = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
      <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg border border-gray-200">
        <IconoExplo />
        <h2 className="text-center text-2xl font-bold text-red-600 mb-4">
          Acceso Denegado
        </h2>
        <p className="text-center text-gray-600 mb-6">
          No tienes permisos para acceder a esta sección.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
          >
            Volver atrás
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccesoDenegado;
