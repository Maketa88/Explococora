import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import { AlertTriangle, X, ArrowLeft, Trash2, Eye, EyeOff, UserX } from 'lucide-react';

const EliminarUsuario = () => {
  const { tipoUsuario = '', idUsuario = '' } = useParams();
  const [formData, setFormData] = useState({
    cedula: idUsuario || '',
    contrasena: '',
    confirmacion: '',
    tipoUsuario: tipoUsuario || 'guia' // Por defecto guía, pero puede ser 'operador'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmacionValida, setConfirmacionValida] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Obtener datos del usuario a eliminar si se proporciona un ID
  useEffect(() => {
    if (formData.cedula) {
      fetchUserData();
    }
  }, [formData.cedula, formData.tipoUsuario]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const endpoint = formData.tipoUsuario === 'guia' 
        ? `http://localhost:10101/guia/perfil-completo/${formData.cedula}`
        : `http://localhost:10101/operador/perfil-completo/${formData.cedula}`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserData(response.data);
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  };

  // Manejar el contador regresivo para redirección
  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Redireccionar al panel de gestión de usuarios
        navigate('/VistaAdmin/GestionUsuarios');
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
      setConfirmacionValida(value.toLowerCase() === 'eliminar usuario');
    }
  };

  const handleTipoUsuarioChange = (e) => {
    setFormData(prev => ({
      ...prev,
      tipoUsuario: e.target.value
    }));
    
    // Limpiar datos del usuario cuando se cambia el tipo
    setUserData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que la confirmación sea correcta
    if (!confirmacionValida) {
      showAlert('Debe escribir "eliminar usuario" para confirmar', 'error');
      return;
    }
    
    // Validar que la cédula esté ingresada
    if (!formData.cedula) {
      showAlert('Debe ingresar la cédula del usuario', 'error');
      return;
    }
    
    // Validar que la contraseña esté ingresada
    if (!formData.contrasena) {
      showAlert('Debe ingresar su contraseña de administrador', 'error');
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

      // Seleccionar el endpoint correcto según el tipo de usuario
      const endpoint = formData.tipoUsuario === 'guia'
        ? `http://localhost:10101/guia/eliminar/${formData.cedula}`
        : `http://localhost:10101/operador/eliminar/${formData.cedula}`;

      // Llamada a la API para eliminar el usuario
      await axios.delete(
        endpoint,
        {
          data: { contrasena: formData.contrasena },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const usuarioTipo = formData.tipoUsuario === 'guia' ? 'guía' : 'operador';
      showAlert(`${usuarioTipo.charAt(0).toUpperCase() + usuarioTipo.slice(1)} eliminado exitosamente. Será redirigido en unos segundos.`, 'success');
      
      // Iniciar cuenta regresiva para redirección
      setCountdown(5);
      
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      
      let errorMessage;
      
      switch (error.response?.status) {
        case 401:
          errorMessage = 'Credenciales de administrador inválidas';
          break;
        case 403:
          errorMessage = 'No tiene permisos de administrador para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado';
          break;
        case 400:
          errorMessage = 'La contraseña del administrador es incorrecta';
          break;
        default:
          errorMessage = error.response?.data?.message || 'Error al eliminar el usuario';
      }
      
      showAlert(errorMessage, 'error');
      setSubmitting(false);
    }
  };

  const AlertComponent = () => {
    if (!alert.show) return null;
    
    const bgColor = alert.type === 'error' ? 'bg-red-600' : 'bg-green-600';
    const Icon = alert.type === 'error' ? AlertTriangle : UserX;
    
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

  const getNombreUsuario = () => {
    if (!userData) return '';
    
    const data = Array.isArray(userData) ? userData[0] : userData;
    return data.nombre || 'Usuario';
  };

  return (
    <DashboardLayoutAdmin>
      <div className="p-6">
        <div className="bg-teal-900 rounded-lg p-8 shadow-lg max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mr-4">
              <Trash2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Eliminar {formData.tipoUsuario === 'guia' ? 'Guía' : 'Operador'}
            </h2>
          </div>
          
          <AlertComponent />
          
          <div className="mb-6 text-white">
            <p className="text-lg">
              {userData ? (
                <>Esta acción eliminará permanentemente al {formData.tipoUsuario === 'guia' ? 'guía' : 'operador'} <strong>{getNombreUsuario()}</strong> y todos sus datos asociados.</>
              ) : (
                <>Esta acción eliminará permanentemente la cuenta del {formData.tipoUsuario === 'guia' ? 'guía' : 'operador'} y todos los datos asociados.</>
              )}
            </p>
            <ul className="list-disc pl-5 mt-2 text-white opacity-90">
              <li>El usuario perderá acceso a todos sus datos y configuraciones personales</li>
              <li>No podrá recuperar la cuenta después de eliminarla</li>
              {formData.tipoUsuario === 'guia' && (
                <li>Las rutas asignadas deberán ser reasignadas a otro guía</li>
              )}
            </ul>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Tipo de Usuario
                </label>
                <select
                  name="tipoUsuario"
                  value={formData.tipoUsuario}
                  onChange={handleTipoUsuarioChange}
                  className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600"
                >
                  <option value="guia">Guía</option>
                  <option value="operador">Operador</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Cédula del {formData.tipoUsuario === 'guia' ? 'Guía' : 'Operador'}
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Su Contraseña de Administrador
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-teal-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-teal-300 mt-1">
                  Debe ingresar su propia contraseña de administrador para autorizar esta acción
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Confirmar eliminación
                </label>
                <p className="text-sm mb-2 text-white opacity-80">
                  Para confirmar, escriba "eliminar usuario" en el campo a continuación
                </p>
                <input
                  type="text"
                  name="confirmacion"
                  value={formData.confirmacion}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600"
                  required
                  placeholder="eliminar usuario"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end mt-8 space-x-4">
              <button
                type="button"
                onClick={() => navigate("/VistaAdmin/GestionUsuarios")}
                className="py-2 px-6 bg-teal-700 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2"
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
                    : 'bg-teal-500'
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
                    Eliminar {formData.tipoUsuario === 'guia' ? 'Guía' : 'Operador'}
                  </>
                )}
              </button>
            </div>
            
            {countdown !== null && (
              <div className="mt-4 text-center text-white">
                Redirigiendo en {countdown} segundos...
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayoutAdmin>
  );
};

export default EliminarUsuario;
