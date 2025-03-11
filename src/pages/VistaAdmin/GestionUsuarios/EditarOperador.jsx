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
    
    // Guardar la configuración original de toast
    const originalToast = { ...toast };
    
    // Crear una función personalizada para filtrar toasts no relacionados con este componente
    const toastFilter = (message, type) => {
      // Lista de patrones que queremos filtrar
      const filteredPatterns = [
        "actualizar los estados",
        "Error al actualizar estados",
        "Formato inesperado en la respuesta del servidor",
        "sincronizarEstados",
        "operadorEstadoService"
      ];
      
      // Comprobar si el mensaje contiene alguno de los patrones a filtrar
      for (const pattern of filteredPatterns) {
        if (message && typeof message === 'string' && message.includes(pattern)) {
          return false; // No mostrar este mensaje
        }
      }
      
      return true; // Mostrar otros mensajes
    };

    // Sobrescribir temporalmente las funciones de toast
    const interceptToast = (fn) => (message, options) => {
      if (toastFilter(message, fn.name)) {
        return originalToast[fn.name](message, options);
      }
      return { id: 'filtered' };
    };
    
    // Aplicar el interceptor a las funciones toast comunes
    toast.error = interceptToast(toast.error);
    toast.warning = interceptToast(toast.warning);
    toast.info = interceptToast(toast.info);
    toast.success = interceptToast(toast.success);
    
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
            : `http://localhost:10101/uploads/images/${operador.foto}`
        );
      } else {
        // Configurar avatar predeterminado si no hay foto
        setPreviewFoto(`https://ui-avatars.com/api/?name=${operador.primerNombre}+${operador.primerApellido}&background=0D8ABC&color=fff`);
      }
      
      setDataLoaded(true);
    }
    
    // Limpiar el interceptor cuando el componente se desmonte
    return () => {
      toast.error = originalToast.error;
      toast.warning = originalToast.warning;
      toast.info = originalToast.info;
      toast.success = originalToast.success;
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
          `http://localhost:10101/operador-turistico/actualizar/${operador.cedula}`,
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
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white">Cargando información del operador...</p>
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
                e.target.src = `https://ui-avatars.com/api/?name=${formData.primerNombre}+${formData.primerApellido}&background=0D8ABC&color=fff`;
              }}
            />
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Actualizar Información del Operador
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 text-red-300 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Sección para foto de perfil */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div 
                className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-blue-500 cursor-pointer"
                onClick={handleMostrarImagenAmpliada}
              >
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${formData.primerNombre}+${formData.primerApellido}&background=0D8ABC&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-700 text-white">
                    <User size={64} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Nombre completo del operador */}
            <h3 className="text-xl font-semibold text-white mt-2 mb-1">
              {getNombreCompleto()}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {formData.email}
              {formData.telefono && ` • ${formData.telefono}`}
            </p>
            
            <p className="text-sm mt-2 text-gray-300">
              Haz clic en la imagen para verla ampliada
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Cédula
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                disabled
                className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-70"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Primer Nombre *
              </label>
              <input
                type="text"
                name="primerNombre"
                value={formData.primerNombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Segundo Nombre
              </label>
              <input
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Primer Apellido *
              </label>
              <input
                type="text"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Segundo Apellido
              </label>
              <input
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe una breve descripción sobre el operador, su experiencia y habilidades..."
              ></textarea>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              type="submit"
              disabled={updating}
              className={`py-2 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 flex items-center gap-2 ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
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
              className="py-2 px-6 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors duration-200"
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
