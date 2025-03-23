import React, { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, X, Package } from 'lucide-react';
import { toast } from 'react-toastify';

const EliminarPaquetes = ({ onClose, onDeleted, paquete, mostrarAlerta }) => {
  // Estado para mensajes de error/éxito
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Token para autenticación
  const token = localStorage.getItem('token');
  
  // Función para eliminar el paquete
  const handleEliminar = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Asegurarse de que tenemos un ID válido y que sea un número
      let paqueteId = paquete.idPaquete || paquete.id;
      
      // Convertir a número si es una cadena
      if (typeof paqueteId === 'string') {
        paqueteId = parseInt(paqueteId, 10);
      }
      
      if (!paqueteId || isNaN(paqueteId)) {
        throw new Error('ID de paquete no válido');
      }
      
      console.log('Intentando eliminar paquete con ID:', paqueteId);
      
      // Usar el ID numérico en la URL
      const response = await axios({
        method: 'DELETE',
        url: `http://localhost:10101/paquete/eliminar/${paqueteId}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Respuesta completa:', response);
      toast.success('Paquete eliminado correctamente', {
        containerId: 'gestion-paquetes'
      });
      
      // Usar también la función de alerta personalizada si está disponible
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta('Paquete eliminado correctamente', 'success');
      }
      
      // Ejecutar callback de eliminación exitosa
      if (onDeleted) {
        onDeleted();
      }
      
      // Cerrar el modal
      onClose();
    } catch (err) {
      console.error('Error al eliminar paquete:', err);
      
      // Intentar extraer el mensaje de error
      let errorMessage = 'Error al eliminar el paquete';
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.mensaje) {
          errorMessage = err.response.data.mensaje;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Mostrar mensaje de error específico para ayudar a depurar
      console.error('Mensaje de error específico:', errorMessage);
      console.error('Código de estado HTTP:', err.response?.status);
      
      // Verificar si el token es válido
      if (err.response?.status === 401) {
        errorMessage = 'Sesión expirada o no autorizada. Por favor, inicie sesión nuevamente.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        containerId: 'gestion-paquetes'
      });
      
      // Usar también la función de alerta personalizada si está disponible
      if (typeof mostrarAlerta === 'function') {
        mostrarAlerta(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md text-gray-800 animate-fadeIn overflow-hidden">
        <div className="bg-emerald-700 text-white p-6 border-b border-emerald-600">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6" />
              Eliminar Paquete
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-rose-100 p-4 rounded-lg mb-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-rose-700">¿Está seguro de eliminar este paquete?</h3>
                <p className="text-sm text-rose-600 mt-1">
                  Esta acción no se puede deshacer. El paquete será eliminado permanentemente del sistema
                  junto con todas sus imágenes asociadas.
                </p>
              </div>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <h4 className="font-bold mb-2 text-emerald-600">Detalles del paquete:</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-emerald-600">Nombre:</span> {paquete.nombrePaquete}</li>
                <li><span className="text-emerald-600">Duración:</span> {paquete.duracion}</li>
                <li><span className="text-emerald-600">Precio:</span> ${paquete.precio}</li>
                <li>
                  <span className="text-emerald-600">Descripción:</span>
                  <p className="text-gray-700 mt-1 line-clamp-2">{paquete.descripcion}</p>
                </li>
              </ul>
            </div>
            
            {error && (
              <div className="bg-rose-100 p-3 rounded mt-4 text-rose-700 text-sm">
                {error}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Eliminando...
                </>
              ) : (
                <>Eliminar Paquete</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EliminarPaquetes;
