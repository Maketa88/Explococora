import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { ArrowLeft, CheckCircle, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { RegistroCliente } from "../../../services/RegistroCliente";

const NuevoGuia = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    contrasenia: '',
    cedula: ''
  });
  
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para mostrar alertas (solo la flotante)
  const showAlert = (message, type) => {
    setAlert({
      show: true,
      message,
      type
    });
    
    // Ocultar la alerta después de 5 segundos
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Componente de alerta flotante (la única que queremos mantener)
  const AlertComponent = () => {
    if (!alert.show) return null;
    
    if (alert.type === 'success') {
      return (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className="bg-green-500 text-white px-4 py-3 rounded-md shadow-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">{alert.message}</span>
            <button 
              onClick={() => setAlert(prev => ({ ...prev, show: false }))}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }
    
    // Alerta de error (mantener el estilo actual)
    return (
      <div className="fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 bg-red-600 text-white">
        <AlertCircle className="w-5 h-5" />
        <span>{alert.message}</span>
        <button 
          onClick={() => setAlert(prev => ({ ...prev, show: false }))}
          className="ml-2 text-white hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert({ show: false, message: '', type: '' });
    
    try {
      const guiaData = {
        cedula: formData.cedula,
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre || '',
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido || '',
        email: formData.email,
        contrasenia: formData.contrasenia
      };
      
      // eslint-disable-next-line
      const response = await RegistroCliente(guiaData);
      
      // Mostrar alerta de éxito con el mensaje específico
      showAlert("¡Guía registrado correctamente!", "success");
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate('/VistaOperador/guias');
      }, 2000);
    } catch (error) {
      console.error('Error al registrar guía:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          // Error de validación
          if (data.message && data.message.includes('email')) {
            showAlert("El correo electrónico ingresado no es válido o ya está en uso.", "error");
          } else if (data.message && data.message.includes('cedula')) {
            showAlert("La cédula ingresada no es válida o ya está registrada.", "error");
          } else if (data.message && data.message.includes('contrasenia')) {
            showAlert("La contraseña debe tener al menos 6 caracteres.", "error");
          } else {
            showAlert(data.message || "Hay campos inválidos en el formulario. Por favor, revise la información.", "error");
          }
        } else if (status === 409) {
          // Conflicto - recurso ya existe
          showAlert("Ya existe un guía con este correo o cédula en el sistema.", "error");
        } else if (status === 401 || status === 403) {
          // No autorizado o prohibido
          showAlert("No tiene permisos para realizar esta acción.", "error");
        } else if (status >= 500) {
          // Error del servidor
          showAlert("Error en el servidor. Por favor, intente más tarde.", "error");
        } else {
          // Otros errores
          showAlert(data.message || "Error al registrar el guía. Por favor, intente nuevamente.", "error");
        }
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        showAlert("No se pudo conectar con el servidor. Verifique su conexión a internet.", "error");
      } else {
        // Error al configurar la solicitud
        showAlert("Error al procesar la solicitud. Por favor, intente nuevamente.", "error");
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Renderizar el componente de alerta */}
      <AlertComponent />
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Encabezado verde */}
        <div className="bg-emerald-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Registrar Nuevo Guía</h1>
            <button 
              onClick={() => navigate('/VistaOperador/guias')}
              className="text-white hover:text-gray-200 bg-emerald-800 hover:bg-emerald-900 rounded-full p-1.5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Formulario con mejor estilo */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sección de información personal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Primer Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="primerNombre"
                  value={formData.primerNombre}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ingrese el primer nombre"
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
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ingrese el segundo nombre (opcional)"
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
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ingrese el primer apellido"
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
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ingrese el segundo apellido (opcional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ingrese el número de cédula"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="ejemplo.guia@explococora.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="contrasenia"
                    value={formData.contrasenia}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ingrese la contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {passwordVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/VistaOperador/guias')}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md order-2 sm:order-1"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md flex items-center justify-center order-1 sm:order-2 mb-3 sm:mb-0 shadow-sm"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Registrar Guía
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NuevoGuia; 