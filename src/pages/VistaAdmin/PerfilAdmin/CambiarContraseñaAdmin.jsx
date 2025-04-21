import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DashboardLayoutAdmin from "../../../layouts/DashboardLayoutAdmin";
import { Lock, ArrowLeft, Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CambiarContraseñaAdmin = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [cambiosRealizados, setCambiosRealizados] = useState(false);
  const [requisitosContrasena, setRequisitosContrasena] = useState({
    longitud: false,
    mayuscula: false,
    minuscula: false,
    numero: false,
    especial: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch admin email from token or localStorage if available
    const fetchAdminData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(
          'https://servicio-explococora.onrender.com/administrador',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Handle response which could be an array or a single object
        const adminData = Array.isArray(response.data) ? response.data[0] : response.data;
        setUserEmail(adminData.email);
      } catch (error) {
        console.error("Error al obtener datos del administrador:", error);
        showAlert("Error al obtener datos del administrador", "error");
      }
    };

    fetchAdminData();
  }, []);

  const verificarRequisitos = (contrasena) => {
    setRequisitosContrasena({
      longitud: contrasena.length >= 8,
      mayuscula: /[A-Z]/.test(contrasena),
      minuscula: /[a-z]/.test(contrasena),
      numero: /[0-9]/.test(contrasena),
      especial: /[!@#$%^&*.]/.test(contrasena)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let valorValidado = value;
    
    if (name === 'newPassword') {
      verificarRequisitos(valorValidado);
    }
    
    setFormData(prev => {
      const nuevoEstado = {
        ...prev,
        [name]: valorValidado
      };
      
      // Verificar si hay cambios en la contraseña
      const nuevaContrasenaDiferente = 
        nuevoEstado.newPassword !== "" && 
        nuevoEstado.newPassword !== nuevoEstado.currentPassword;
      
      const confirmacionCorrecta = 
        nuevoEstado.confirmPassword !== "" && 
        nuevoEstado.newPassword === nuevoEstado.confirmPassword;
      
      const contrasenaActualIngresada = nuevoEstado.currentPassword !== "";
      
      setCambiosRealizados(
        nuevaContrasenaDiferente && 
        confirmacionCorrecta && 
        contrasenaActualIngresada
      );
      
      return nuevoEstado;
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validarContrasenaSegura = (contrasena) => {
    const tieneMinuscula = /[a-z]/.test(contrasena);
    const tieneMayuscula = /[A-Z]/.test(contrasena);
    const tieneNumero = /[0-9]/.test(contrasena);
    const tieneEspecial = /[!@#$%^&*.]/.test(contrasena);
    
    return tieneMinuscula && tieneMayuscula && tieneNumero && tieneEspecial;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que la nueva contraseña sea diferente a la actual
    if (formData.newPassword === formData.currentPassword) {
      showAlert("La nueva contraseña no puede ser igual a la actual", "error");
      return;
    }

    // Validar contraseña segura
    if (!validarContrasenaSegura(formData.newPassword)) {
      showAlert("La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial", "error");
      return;
    }
    
    // Validar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      showAlert("Las contraseñas no coinciden", "error");
      return;
    }
    
    setUpdating(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("No se encontró el token de autenticación", "error");
      setUpdating(false);
      return;
    }

    try {
      const response = await axios.patch(
        `https://servicio-explococora.onrender.com/administrador/cambiarcontrasenia/${userEmail}`,
        { 
          contrasenaActual: formData.currentPassword,
          contrasenia: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        showAlert("Contraseña actualizada exitosamente", "success");
        
        // Limpiar el formulario
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate("/VistaAdmin/PerfilAdmin");
        }, 2000);
      }
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      
      let errorMessage;
      
      switch (error.response?.status) {
        case 401:
          errorMessage = "Credenciales inválidas";
          break;
        case 403:
          errorMessage = "No tiene permisos para realizar esta acción";
          break;
        case 404:
          errorMessage = "Usuario no encontrado";
          break;
        case 409:
          errorMessage = "La contraseña actual es incorrecta";
          break;
        case 400:
          errorMessage = "La nueva contraseña no puede ser igual a la actual";
          break;
        default:
          errorMessage = error.response?.data?.message || "Error al cambiar la contraseña";
      }
      
      showAlert(errorMessage, "error");
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const showAlert = (message, type) => {
    if (type === "success") {
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } else {
      toast.error(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  return (
    <DashboardLayoutAdmin>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="p-3 sm:p-6">
        <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl overflow-hidden shadow-xl max-w-5xl mx-auto">
          {/* Header con estilo moderno */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 right-20 w-20 h-20 rounded-full bg-teal-500 opacity-20 blur-xl"></div>
              <div className="absolute bottom-0 right-10 w-30 h-30 rounded-full bg-teal-400 opacity-10 blur-2xl"></div>
              <div className="absolute top-5 left-1/2 w-10 h-10 rounded-full bg-teal-300 opacity-20 blur-md"></div>
            </div>

            <div className="flex items-center relative">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-4 text-teal-600">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Cambiar Contraseña
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Campo de contraseña actual */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-teal-50 text-gray-800 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Campo de nueva contraseña */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-teal-50 text-gray-800 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Campo de confirmar contraseña */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-teal-50 text-gray-800 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`text-xs mt-1 ${
                  formData.newPassword === formData.confirmPassword
                    ? "text-teal-600"
                    : "text-red-500"
                }`}>
                  {formData.newPassword === formData.confirmPassword
                    ? "Las contraseñas coinciden"
                    : "Las contraseñas no coinciden"}
                </p>
              )}
            </div>

            {/* Requisitos de contraseña */}
            <div className="bg-teal-50 rounded-lg p-4 mb-6 border border-teal-100">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-medium text-teal-700">
                  Requisitos de la contraseña
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`flex items-center gap-2 ${requisitosContrasena.longitud ? 'text-teal-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 ${requisitosContrasena.longitud ? 'opacity-100' : 'opacity-50'}`} />
                  <span className="text-xs">8 caracteres</span>
                </div>
                <div className={`flex items-center gap-2 ${requisitosContrasena.mayuscula ? 'text-teal-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 ${requisitosContrasena.mayuscula ? 'opacity-100' : 'opacity-50'}`} />
                  <span className="text-xs">Al menos una mayúscula</span>
                </div>
                <div className={`flex items-center gap-2 ${requisitosContrasena.minuscula ? 'text-teal-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 ${requisitosContrasena.minuscula ? 'opacity-100' : 'opacity-50'}`} />
                  <span className="text-xs">Al menos una minúscula</span>
                </div>
                <div className={`flex items-center gap-2 ${requisitosContrasena.numero ? 'text-teal-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 ${requisitosContrasena.numero ? 'opacity-100' : 'opacity-50'}`} />
                  <span className="text-xs">Al menos un número</span>
                </div>
                <div className={`flex items-center gap-2 ${requisitosContrasena.especial ? 'text-teal-600' : 'text-gray-500'} col-span-1 sm:col-span-2`}>
                  <CheckCircle className={`w-4 h-4 ${requisitosContrasena.especial ? 'opacity-100' : 'opacity-50'}`} />
                  <span className="text-xs">Al menos un carácter especial (!@#$%^&*.)</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate("/VistaAdmin/Settings")}
                className="py-2 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver
              </button>

              <button
                type="submit"
                disabled={updating || !cambiosRealizados || !validarContrasenaSegura(formData.newPassword)}
                className={`py-2 px-6 rounded-lg flex items-center gap-2 transition-all duration-300 
                  ${updating ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 
                  cambiosRealizados && validarContrasenaSegura(formData.newPassword) ? 
                  'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg hover:shadow-teal-200/50' :
                  'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {updating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  "Cambiar Contraseña"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayoutAdmin>
  );
};

export default CambiarContraseñaAdmin;
