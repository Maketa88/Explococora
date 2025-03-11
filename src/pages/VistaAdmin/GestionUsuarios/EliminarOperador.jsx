import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EliminarOperador = ({ operador, onClose, onDeleteSuccess }) => {
  // Replace the placeholder with a Base64 encoded image
  const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiM2QjcyODAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjRkZGRkZGIj5ObyBGb3RvPC90ZXh0Pjwvc3ZnPg==";
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef(null);

  const startCountdown = () => {
    setCountdownActive(true);
    setCountdown(5);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setCountdownActive(false);
          handleActualDelete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      setCountdownActive(false);
    }
  };

  const handleActualDelete = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
        setIsDeleting(false);
        return;
      }

      const cedula = operador.cedula;
      
      // Lista de posibles endpoints para probar
      const endpoints = [
        `http://localhost:10101/operador-turistico/eliminar/${cedula}`
      ];
      
      let success = false;
      
      // Probar cada endpoint hasta encontrar uno que funcione
      for (const endpoint of endpoints) {
        try {
          console.log(`Intentando eliminar operador con endpoint: ${endpoint}`);
          const response = await axios.delete(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.status === 200 || response.status === 204) {
            success = true;
            console.log("Operador eliminado con éxito");
            break;
          }
        } catch (error) {
          console.error(`Error con endpoint ${endpoint}:`, error);
        }
      }
      
      if (success) {
        toast.success("Operador eliminado correctamente");
        onDeleteSuccess(operador.cedula);
      } else {
        toast.error("No se pudo eliminar el operador. Por favor, inténtelo de nuevo.");
      }
    } catch (error) {
      console.error("Error al eliminar operador:", error);
      toast.error("Error al eliminar operador: " + (error.response?.data?.message || error.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    startCountdown();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-700 transform transition-all">
        <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Confirmar Eliminación</h2>
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg">
          <div className="relative">
            <img 
              src={operador.foto || placeholderImage} 
              alt={`${operador.primerNombre} ${operador.primerApellido}`} 
              className="w-20 h-20 rounded-full object-cover border-2 border-red-500 shadow-lg"
            />
            <div className="absolute -top-1 -right-1 bg-red-600 w-6 h-6 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{operador.primerNombre} {operador.primerApellido}</p>
            <p className="text-gray-400 text-sm">Cédula: {operador.cedula}</p>
            <div className="mt-1 inline-block px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full">
              Será eliminado permanentemente
            </div>
          </div>
        </div>
        <p className="text-gray-300 mb-6 bg-yellow-800/20 border-l-4 border-yellow-600 pl-3 py-2 italic">
          ¿Está seguro que desea eliminar este operador? Esta acción no se puede deshacer.
        </p>
        
        {countdownActive && (
          <div className="mb-6 bg-red-900/20 border border-red-600 rounded-lg p-4 text-center">
            <p className="text-white mb-2">Eliminando en <span className="font-bold text-2xl text-red-500">{countdown}</span> segundos</p>
            <button 
              onClick={cancelCountdown}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Cancelar eliminación
            </button>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transform hover:-translate-y-0.5"
            disabled={isDeleting || countdownActive}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-2.5 px-5 rounded-lg transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 transform hover:-translate-y-0.5 shadow-lg"
            disabled={isDeleting || countdownActive}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Eliminando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliminarOperador;
