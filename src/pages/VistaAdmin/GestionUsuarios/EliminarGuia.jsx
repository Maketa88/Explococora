import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EliminarGuia = ({ guia, onClose, onDeleteSuccess }) => {
  // Replace the placeholder with a Base64 encoded image
  const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiM2QjcyODAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjRkZGRkZGIj5ObyBGb3RvPC90ZXh0Pjwvc3ZnPg==";
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
        setIsDeleting(false);
        return;
      }

      const cedula = guia.cedula;
      
      // Simplificar la lógica de eliminación - usar un solo endpoint
      try {
        const endpoint = `https://servicio-explococora.onrender.com/guia/eliminar/${cedula}`;
        console.log(`Eliminando guía con endpoint: ${endpoint}`);
        
        const response = await axios.delete(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Si llegamos aquí, la eliminación fue exitosa
        toast.success("Guía eliminado correctamente");
        
        // Llamar a la función de éxito pasada como prop
        if (onDeleteSuccess) {
          onDeleteSuccess(cedula);
        }
        
        // Cerrar inmediatamente la vista
        onClose();
      } catch (err) {
        console.error(`Error al eliminar guía:`, err);
        toast.error(err.response?.data?.message || "Error al eliminar el guía. Intente nuevamente.");
      }
    } catch (error) {
      console.error("Error general al eliminar guía:", error);
      toast.error("Ocurrió un error inesperado. Por favor, intente nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-200 transform transition-all">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Confirmar Eliminación</h2>
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="relative">
            <img 
              src={guia.foto || placeholderImage} 
              alt={`${guia.primerNombre} ${guia.primerApellido}`} 
              className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-lg"
            />
            <div className="absolute -top-1 -right-1 bg-red-600 w-6 h-6 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-gray-800 font-bold text-lg">{guia.primerNombre} {guia.primerApellido}</p>
            <p className="text-gray-600 text-sm">Cédula: {guia.cedula}</p>
            <div className="mt-1 inline-block px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
              Será eliminado permanentemente
            </div>
          </div>
        </div>
        <p className="text-gray-700 mb-6 bg-yellow-50 border-l-4 border-red-400 pl-3 py-2 italic">
          ¿Está seguro que desea eliminar este guía? Esta acción no se puede deshacer.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500"
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
  );
};

export default EliminarGuia;
