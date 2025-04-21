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
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: 'No hay token de autenticación. Por favor, inicie sesión nuevamente.',
          confirmButtonColor: '#3085d6'
        });
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
      } catch (updateError) {
        if (updateError.response?.status === 403) {
          throw new Error("No tienes permiso para actualizar este operador. Solo los usuarios con rol de operador pueden realizar esta acción.");
        }
        throw updateError; // Re-lanzar otros errores
      }

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
      
      toast.success("Información del operador actualizada correctamente");
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar el operador:", err);
      const errorMessage = err.message || err.response?.data?.message || "Error al actualizar la información del operador";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Si es un error de permisos, mostrar un mensaje más específico
      if (err.response?.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Error de permisos',
          text: 'No tienes los permisos necesarios para realizar esta acción. Esta función está reservada para usuarios con rol de operador.',
          confirmButtonColor: '#3085d6'
        });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
      
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-screen overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Actualizar Información del Operador
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Sección para foto de perfil */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-emerald-500 cursor-pointer"
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
                  <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white">
                    <User size={48} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Nombre completo del operador */}
            <h3 className="text-xl font-semibold text-gray-800 mt-2 mb-1">
              {getNombreCompleto()}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {formData.email}
              {formData.telefono && ` • ${formData.telefono}`}
            </p>
            
            <p className="text-sm mt-2 text-gray-500">
              Haz clic en la imagen para verla ampliada
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Cédula
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                disabled
                className="w-full px-4 py-2 rounded-lg border bg-gray-100 border-gray-200 text-gray-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Primer Nombre *
              </label>
              <input
                type="text"
                name="primerNombre"
                value={formData.primerNombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Segundo Nombre
              </label>
              <input
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Primer Apellido *
              </label>
              <input
                type="text"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Segundo Apellido
              </label>
              <input
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Escribe una breve descripción sobre el operador, su experiencia y habilidades..."
              ></textarea>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              type="submit"
              disabled={updating}
              className={`py-2 px-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors duration-200 flex items-center gap-2 ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {updating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-6 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default EditarOperador;
