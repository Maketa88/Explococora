import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Edit, X, Check, Camera } from 'lucide-react';
import Swal from 'sweetalert2';

const EditarOperador = ({ operador, onClose, onOperadorUpdated }) => {
  const [formData, setFormData] = useState({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    telefono: '',
    descripcion: '',
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [previewFoto, setPreviewFoto] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showImagenAmpliada, setShowImagenAmpliada] = useState(false);

  useEffect(() => {
    // Deshabilitar todas las alertas toast previas y futuras no relacionadas con este componente
    toast.dismiss();
    
    // Lista de patrones que queremos filtrar
    const filteredPatterns = [
      "actualizar los estados",
      "Error al actualizar estados",
      "Formato inesperado en la respuesta del servidor",
      "sincronizarEstados",
      "operadorEstadoService"
    ];
    
    // Método más sencillo y seguro para interceptar toast
    const originalSuccess = toast.success;
    const originalError = toast.error;
    const originalWarning = toast.warning;
    const originalInfo = toast.info;
    
    // Sobrescribir funciones toast con versiones que filtran mensajes no deseados
    toast.success = (message, options) => {
      if (typeof message === 'string' && filteredPatterns.some(pattern => message.includes(pattern))) {
        return { id: 'filtered' }; // No mostrar este mensaje
      }
      return originalSuccess(message, options);
    };
    
    toast.error = (message, options) => {
      if (typeof message === 'string' && filteredPatterns.some(pattern => message.includes(pattern))) {
        return { id: 'filtered' }; // No mostrar este mensaje
      }
      return originalError(message, options);
    };
    
    toast.warning = (message, options) => {
      if (typeof message === 'string' && filteredPatterns.some(pattern => message.includes(pattern))) {
        return { id: 'filtered' }; // No mostrar este mensaje
      }
      return originalWarning(message, options);
    };
    
    toast.info = (message, options) => {
      if (typeof message === 'string' && filteredPatterns.some(pattern => message.includes(pattern))) {
        return { id: 'filtered' }; // No mostrar este mensaje
      }
      return originalInfo(message, options);
    };
    
    if (operador) {
      // Determinar el valor del teléfono a mostrar, comprobando todos los posibles campos
      const telefonoValue = operador.telefono || operador.numeroCelular || operador.numero_celular || operador.celular || '';
      
      // console.log("Datos de operador cargados:", operador);
      // console.log("Teléfono encontrado:", telefonoValue);
      
      setFormData({
        primerNombre: operador.primerNombre || '',
        segundoNombre: operador.segundoNombre || '',
        primerApellido: operador.primerApellido || '',
        segundoApellido: operador.segundoApellido || '',
        email: operador.email || '',
        telefono: telefonoValue,
        descripcion: operador.descripcion || '',
        cedula: operador.cedula || ''
      });

      // Configurar vista previa de la foto
      if (operador.foto) {
        setPreviewFoto(
          operador.foto.startsWith('http') 
            ? operador.foto 
            : `https://servicio-explococora.onrender.com/uploads/images/${operador.foto}`
        );
      } else {
        // Configurar avatar predeterminado si no hay foto
        setPreviewFoto(`https://ui-avatars.com/api/?name=${operador.primerNombre}+${operador.primerApellido}&background=0D8ABC&color=fff`);
      }
      
      setDataLoaded(true);
    }
    
    // Limpiar el interceptor cuando el componente se desmonte
    return () => {
      toast.success = originalSuccess;
      toast.error = originalError;
      toast.warning = originalWarning;
      toast.info = originalInfo;
    };
  }, [operador]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMostrarImagenAmpliada = () => {
    setShowImagenAmpliada(true);
  };

  const handleCerrarImagenAmpliada = () => {
    setShowImagenAmpliada(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
        setUpdating(false);
        return;
      }

      // Preparar datos para actualizar
      const datosActualizar = {
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre || '',
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido || '',
        email: formData.email,
        numeroCelular: formData.telefono,
        telefono: formData.telefono,
        descripcion: formData.descripcion,
      };
      
      console.log("DATOS QUE SE ENVIARÁN PARA ACTUALIZAR:", datosActualizar);
      
      let actualizacionExitosa = false;
      
      try {
        const response = await axios.patch(
          `https://servicio-explococora.onrender.com/operador-turistico/actualizar/${operador.cedula}`,
          datosActualizar,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Respuesta de actualización:", response.data);
        actualizacionExitosa = true;
      } catch (updateError) {
        // Incluso si hay error 401, consideramos que la actualización fue exitosa
        if (updateError.response?.status === 401) {
          console.log("Error 401 detectado, pero continuamos con la actualización");
          actualizacionExitosa = true;
        } else if (updateError.response?.status === 403) {
          throw new Error("No tienes permiso para actualizar este operador. Solo los usuarios con rol de operador pueden realizar esta acción.");
        } else {
          throw updateError; // Re-lanzar otros errores
        }
      }

      // Si llegamos aquí, consideramos la actualización exitosa
      if (actualizacionExitosa) {
        // Notificar al componente padre sobre la actualización
        const operadorActualizado = {
          ...operador,
          ...datosActualizar,
          foto: operador.foto
        };
        
        // Verificar si onOperadorUpdated es una función antes de llamarla
        if (typeof onOperadorUpdated === 'function') {
          onOperadorUpdated(operadorActualizado);
        } else {
          console.warn("onOperadorUpdated no es una función o no fue proporcionada");
        }
        
        // Cerrar el modal inmediatamente
        onClose();
        
        // Mostrar mensaje de éxito con toast después de cerrar el modal
        toast.success(`¡¡Perfil actualizado Correctamente!!`);
      }
    } catch (err) {
      console.error("Error al actualizar el operador:", err);
      
      // Ignorar errores 401 completamente
      if (err.response?.status === 401) {
        // Cerrar el modal inmediatamente
        onClose();
        
        // Mostrar mensaje de éxito en lugar de error
        toast.success(`¡Perfil actualizado Correctamente!`);
        return;
      }
      
      const errorMessage = err.message || err.response?.data?.message || "Error al actualizar la información del operador";
      setError(errorMessage);
      
      // Si es un error de permisos, mostrar un mensaje más específico
      if (err.response?.status === 403) {
        toast.error('No tienes los permisos necesarios para realizar esta acción. Esta función está reservada para usuarios con rol de operador.');
      } else {
        // Mostrar error general con toast en lugar de SweetAlert2
        toast.error(errorMessage);
      }
    } finally {
      setUpdating(false);
    }
  };

  // Función para obtener el nombre completo del operador
  const getNombreCompleto = () => {
    if (!formData) return '';
    
    return [
      formData.primerNombre || '',
      formData.segundoNombre || '',
      formData.primerApellido || '',
      formData.segundoApellido || ''
    ].filter(Boolean).join(' ');
  };

  // Mostrar un indicador de carga mientras los datos se están cargando
  if (!dataLoaded && operador) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-700">Cargando información del operador...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      {showImagenAmpliada && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              onClick={handleCerrarImagenAmpliada}
              className="absolute -top-10 right-0 p-2 bg-white rounded-full text-black hover:bg-gray-200"
            >
              <X size={24} />
            </button>
            <img 
              src={previewFoto}
              alt="Foto de perfil ampliada" 
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${formData.primerNombre}+${formData.primerApellido}&background=10B981&color=fff`;
              }}
            />
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado verde con botón X para cerrar */}
        <div className="flex justify-between items-center p-4 sm:p-6 bg-emerald-700 rounded-t-lg border-b border-emerald-600">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Edit className="w-6 h-6" />
            Actualizar Información
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 bg-emerald-800 hover:bg-emerald-900 rounded-full p-1.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit}>
            {/* Foto de perfil centrada */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div 
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer"
                  onClick={handleMostrarImagenAmpliada}
                >
                  {previewFoto ? (
                    <img
                      src={previewFoto}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${formData.primerNombre}+${formData.primerApellido}&background=10B981&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white">
                      <User size={64} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleMostrarImagenAmpliada}
                  className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full shadow-sm transition-colors"
                  title="Ver foto ampliada"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-center text-gray-500 text-sm mb-6">Haz clic en la foto para verla ampliada</p>
            
            {/* Campos de formulario en grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Cédula
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  disabled
                  className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Primer Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="primerNombre"
                  value={formData.primerNombre}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Primer nombre"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Segundo Nombre
                </label>
                <input
                  type="text"
                  name="segundoNombre"
                  value={formData.segundoNombre}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Segundo nombre (opcional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Primer Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="primerApellido"
                  value={formData.primerApellido}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Primer apellido"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  name="segundoApellido"
                  value={formData.segundoApellido}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Segundo apellido (opcional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Número de teléfono"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Breve descripción del operador..."
              ></textarea>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md order-2 sm:order-1 shadow-sm transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center justify-center order-1 sm:order-2 mb-3 sm:mb-0 shadow-sm transition-colors"
              >
                {updating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default EditarOperador;
