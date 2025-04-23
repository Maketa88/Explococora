import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Edit, X, Check } from 'lucide-react';
import Swal from 'sweetalert2';

const EditarGuia = ({ guia, onClose, onGuiaUpdated }) => {
  const [formData, setFormData] = useState({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    telefono: '',
    descripcion: ''
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (guia) {
      // Determinar el valor del teléfono a mostrar, comprobando todos los posibles campos
      const telefonoValue = guia.telefono || guia.numeroCelular || guia.numero_celular || guia.celular || '';
      
      console.log("Datos de guía cargados:", guia);
      console.log("Teléfono encontrado:", telefonoValue);
      
      setFormData({
        primerNombre: guia.primerNombre || '',
        segundoNombre: guia.segundoNombre || '',
        primerApellido: guia.primerApellido || '',
        segundoApellido: guia.segundoApellido || '',
        email: guia.email || '',
        telefono: telefonoValue,
        descripcion: guia.descripcion || ''
      });

      // Configurar vista previa de la foto
      if (guia.foto) {
        setPreviewFoto(
          guia.foto.startsWith('http') 
            ? guia.foto 
            : `https://servicio-explococora.onrender.com/uploads/images/${guia.foto}`
        );
      }
    }
  }, [guia]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectFoto = () => {
    fileInputRef.current.click();
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
        telefono: formData.telefono, // Enviar en ambos campos para asegurarnos
        descripcion: formData.descripcion
      };
      
      console.log("DATOS QUE SE ENVIARÁN PARA ACTUALIZAR:", datosActualizar);
      
      const response = await axios.patch(
        `https://servicio-explococora.onrender.com/guia/actualizar/${guia.cedula}`,
        datosActualizar,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Respuesta de actualización:", response.data);

      // Actualizar específicamente el teléfono en la tabla de teléfonos
      try {
        console.log("Actualizando teléfono específicamente...");
        const telefonoResponse = await axios.post(
          `https://servicio-explococora.onrender.com/guia/telefono/${guia.cedula}`,
          { numeroCelular: formData.telefono },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Teléfono actualizado específicamente:", telefonoResponse.data);
      } catch (telefonoError) {
        console.error("Error al actualizar teléfono específicamente:", telefonoError);
        // No interrumpimos el flujo, continuamos con la actualización general
      }

      // Si hay una foto nueva, subirla
      let fotoActualizada = false;
      if (foto) {
        const formDataFoto = new FormData();
        formDataFoto.append('foto', foto);
        
        try {
          const fotoResponse = await axios.post(
            `https://servicio-explococora.onrender.com/guia/subir-foto/${guia.cedula}`,
            formDataFoto,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
              }
            }
          );
          fotoActualizada = true;
          console.log("Foto actualizada:", fotoResponse.data);
        } catch (fotoError) {
          console.error("Error al actualizar la foto:", fotoError);
        }
      }

      // Mensaje personalizado según si se actualizó la foto o no
      let mensajeExito = `¡La información del guía ${formData.primerNombre} ${formData.primerApellido} ha sido actualizada exitosamente!`;
      if (foto && !fotoActualizada) {
        mensajeExito += " Sin embargo, hubo un problema al actualizar la foto.";
      } else if (foto && fotoActualizada) {
        mensajeExito += " La foto de perfil también se actualizó correctamente.";
      }

      // Mostrar alerta profesional con SweetAlert2
      Swal.fire({
        icon: 'success',
        title: '¡Actualización Exitosa!',
        text: mensajeExito,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Excelente',
        background: '#1e293b',
        color: '#ffffff',
        iconColor: '#22c55e',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });

      // Notificar al componente padre
      if (onGuiaUpdated) {
        onGuiaUpdated({
          ...guia,
          ...datosActualizar,
          foto: fotoActualizada ? URL.createObjectURL(foto) : guia.foto
        });
      }
      
      onClose();
    } catch (error) {
      console.error("Error al actualizar:", error);
      setError(`Error al actualizar: ${error.response?.data?.message || error.message}`);
      
      // Alerta de error con SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Error de Actualización',
        text: `No se pudo actualizar la información: ${error.response?.data?.message || error.message}`,
        confirmButtonColor: '#d33',
        background: '#1e293b',
        color: '#ffffff',
        iconColor: '#ef4444'
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
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
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
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
                  onClick={handleSelectFoto}
                  className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full shadow-sm transition-colors"
                  title="Cambiar foto"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-center text-gray-500 text-sm mb-6">Haz clic en el ícono de lápiz para cambiar la foto</p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFotoChange}
              accept="image/*"
              className="hidden"
            />
            
            {/* Campos de formulario en grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
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
                placeholder="Breve descripción del guía..."
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

export default EditarGuia;
