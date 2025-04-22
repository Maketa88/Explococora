import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EliminarOperador = ({ operador, onClose, onDeleteSuccess }) => {
  // Replace the placeholder with a Base64 encoded image
  const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiM2QjcyODAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjRkZGRkZGIj5ObyBGb3RvPC90ZXh0Pjwvc3ZnPg==";
  const [isDeleting, setIsDeleting] = useState(false);

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
        `https://servicio-explococora.onrender.com/operador-turistico/eliminar/${cedula}`
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
        } catch (err) {
          console.warn(`Error con endpoint ${endpoint}:`, err.message);
        }
      }
      
      if (success) {
        toast.success("Operador eliminado correctamente");
        // Llamar a la función de éxito pasada como prop
        if (onDeleteSuccess) {
          onDeleteSuccess(cedula);
        }
        onClose();
      } else {
        toast.error("No se pudo eliminar el operador. Intente nuevamente.");
      }
    } catch (error) {
      console.error("Error al eliminar operador:", error);
      toast.error(error.response?.data?.message || "Error al eliminar el operador");
    } finally {
      setIsDeleting(false);
    }
  };

  // Modificado para eliminar directamente sin countdown
  const handleDelete = () => {
    handleActualDelete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl transform transition-all">
        <div className="p-4 border-b flex items-center bg-emerald-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path className="text-white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <h2 className="text-xl font-bold text-white">Confirmar Eliminación</h2>
        </div>
        
        <div className="p-4 bg-green-50 m-7">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={operador.foto || placeholderImage} 
                alt={`${operador.primerNombre} ${operador.primerApellido}`} 
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-lg"
              />
              <div className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-gray-800 font-bold text-lg">{operador.primerNombre} {operador.primerApellido}</p>
              <p className="text-gray-600 text-sm">Cédula: {operador.cedula}</p>
              <div className="mt-1 inline-block px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                Será eliminado permanentemente
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="border-l-4 border-red-400 pl-3 py-2 bg-red-50 mb-4 italic text-gray-700">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              ¿Está seguro que desea eliminar este operador? Esta acción no se puede deshacer.
            </span>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-5 rounded-lg transition-all duration-300 focus:outline-none"
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg transition-all duration-300 flex items-center justify-center focus:outline-none"
              disabled={isDeleting}
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
    </div>
  );
};

export default EliminarOperador;
