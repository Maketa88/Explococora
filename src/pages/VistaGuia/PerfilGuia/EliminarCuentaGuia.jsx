import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';
import { AlertTriangle, X, ArrowLeft, Trash2, Lock, CheckCircle } from 'lucide-react';

const EliminarCuentaGuia = () => {
  const [formData, setFormData] = useState({
    cedula: '',
    contrasena: '',
    confirmacion: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmacionValida, setConfirmacionValida] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();

  // Cargar cédula del localStorage al iniciar
  useEffect(() => {
    const cedula = localStorage.getItem('cedula');
    if (cedula) {
      setFormData(prev => ({ ...prev, cedula }));
    }
  }, []);

  // Manejar el contador regresivo para redirección
  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Redireccionar al login cuando el contador llegue a 0
        localStorage.removeItem('token');
        localStorage.removeItem('cedula');
        localStorage.removeItem('rol');
        navigate('/');
      }
    }
  }, [countdown, navigate]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    
    // Auto-cerrar la alerta después de 5 segundos si es de éxito
    if (type === 'success') {
      setTimeout(() => {
        closeAlert();
      }, 5000);
    }
  };

  const closeAlert = () => {
    setAlert({ show: false, message: '', type: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let valorValidado = value;
    
    if (name === 'cedula') {
      valorValidado = value.replace(/\D/g, ''); // Solo permitir números
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: valorValidado
    }));
    
    // Verificar si la confirmación es válida
    if (name === 'confirmacion') {
      setConfirmacionValida(value.toLowerCase() === 'eliminar mi cuenta');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que la confirmación sea correcta
    if (!confirmacionValida) {
      showAlert('Debe escribir "eliminar mi cuenta" para confirmar', 'error');
      return;
    }
    
    // Validar que la cédula esté ingresada
    if (!formData.cedula) {
      showAlert('Debe ingresar su cédula', 'error');
      return;
    }
    
    // Validar que la contraseña esté ingresada
    if (!formData.contrasena) {
      showAlert('Debe ingresar su contraseña', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('No se encontraron credenciales de autenticación', 'error');
        setSubmitting(false);
        return;
      }

      // Llamada a la API para eliminar la cuenta
      await axios.delete(
        `http://localhost:10101/guia/eliminar/${formData.cedula}`,
        {
          data: { contrasena: formData.contrasena },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      showAlert('Cuenta eliminada exitosamente. Será redirigido en unos segundos.', 'success');
      
      // Iniciar cuenta regresiva para redirección
      setCountdown(5);
      
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      
      let errorMessage;
      
      switch (error.response?.status) {
        case 401:
          errorMessage = 'Credenciales inválidas';
          break;
        case 403:
          errorMessage = 'No tiene permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado';
          break;
        case 400:
          errorMessage = 'La contraseña es incorrecta';
          break;
        default:
          errorMessage = error.response?.data?.message || 'Error al eliminar la cuenta';
      }
      
      showAlert(errorMessage, 'error');
      setSubmitting(false);
    }
  };

  const AlertComponent = () => {
    if (!alert.show) return null;
    
    const bgColor = alert.type === 'error' ? 'bg-red-600' : 'bg-green-600';
    const Icon = alert.type === 'error' ? AlertTriangle : CheckCircle;
    
    return (
      <div className={`${bgColor} text-white p-4 rounded-lg mb-6 flex items-start`}>
        <Icon className="w-5 h-5 mr-2 mt-0.5" />
        <div className="flex-1">{alert.message}</div>
        <button onClick={closeAlert} className="text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <DashboardLayoutGuia>
      <div className="p-6">
        <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-8 shadow-lg max-w-3xl mx-auto`}>
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mr-4">
              <Trash2 className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Eliminar Cuenta
            </h2>
          </div>
          
          <AlertComponent />
          
          <div className={`mb-8 p-4 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} border ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
              ¡Advertencia! Esta acción no se puede deshacer
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Al eliminar su cuenta:
            </p>
            <ul className={`list-disc pl-5 mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Perderá acceso a todos sus datos y configuraciones</li>
              <li>No podrá recuperar su historial de rutas y actividades</li>
              <li>Su perfil será eliminado permanentemente del sistema</li>
              <li>Todas sus reservas pendientes serán canceladas</li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cédula
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    <Lock className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Para confirmar, escriba "eliminar mi cuenta"
                </label>
                <input
                  type="text"
                  name="confirmacion"
                  value={formData.confirmacion}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${
                    formData.confirmacion 
                      ? (confirmacionValida 
                          ? (darkMode ? 'border-green-500' : 'border-green-500') 
                          : (darkMode ? 'border-red-500' : 'border-red-500'))
                      : (darkMode ? 'border-gray-600' : 'border-gray-300')
                  }`}
                  required
                  placeholder="eliminar mi cuenta"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end mt-8 space-x-4">
              <button
                type="button"
                onClick={() => navigate("/VistaGuia/PerfilGuia")}
                className="py-2 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={submitting || !confirmacionValida || !formData.contrasena || !formData.cedula}
                className={`py-2 px-6 ${
                  confirmacionValida && formData.contrasena && formData.cedula
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-500'
                } text-white rounded-lg flex items-center gap-2 ${
                  (submitting || !confirmacionValida || !formData.contrasena || !formData.cedula)
                    ? 'opacity-70 cursor-not-allowed'
                    : ''
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Eliminar Cuenta
                  </>
                )}
              </button>
            </div>
            
            {countdown !== null && (
              <div className={`mt-4 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Redirigiendo en {countdown} segundos...
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayoutGuia>
  );
};

export default EliminarCuentaGuia;
