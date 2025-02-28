import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import DashboardLayoutGuia from "../../../layouts/DashboardLayoutGuia";
import { AlertCircle, CheckCircle, X, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

const CambiarContraseña = () => {
  const [formData, setFormData] = useState({
    cedula: '',
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  });
  const [showPassword, setShowPassword] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [cambiosRealizados, setCambiosRealizados] = useState(false);
  const [requisitosContrasena, setRequisitosContrasena] = useState({
    longitud: false,
    mayuscula: false,
    minuscula: false,
    numero: false,
    especial: false
  });
  const navigate = useNavigate();

  const verificarRequisitos = (contrasena) => {
    setRequisitosContrasena({
      longitud: contrasena.length >= 8,
      mayuscula: /[A-Z]/.test(contrasena),
      minuscula: /[a-z]/.test(contrasena),
      numero: /[0-9]/.test(contrasena),
      especial: /[\W_]/.test(contrasena)
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let valorValidado = value;
    
    if (name === 'cedula') {
      valorValidado = value.replace(/\D/g, '');
    } else if (['nuevaContrasena', 'confirmarContrasena'].includes(name)) {
      if (name === 'nuevaContrasena') {
        verificarRequisitos(valorValidado);
      }
    }
    
    setFormData(prev => {
      const nuevoEstado = {
        ...prev,
        [name]: valorValidado
      };
      
      // Verificar si hay cambios en la contraseña
      const nuevaContrasenaDiferente = 
        nuevoEstado.nuevaContrasena !== "" && 
        nuevoEstado.nuevaContrasena !== nuevoEstado.contrasenaActual;
      
      const confirmacionCorrecta = 
        nuevoEstado.confirmarContrasena !== "" && 
        nuevoEstado.nuevaContrasena === nuevoEstado.confirmarContrasena;
      
      const contrasenaActualIngresada = nuevoEstado.contrasenaActual !== "";
      const cedulaValida = nuevoEstado.cedula !== "";
      
      setCambiosRealizados(
        nuevaContrasenaDiferente && 
        confirmacionCorrecta && 
        contrasenaActualIngresada &&
        cedulaValida
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
    const tieneEspecial = /[\W_]/.test(contrasena);
    
    return tieneMinuscula && tieneMayuscula && tieneNumero && tieneEspecial;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que la nueva contraseña sea diferente a la actual
    if (formData.nuevaContrasena === formData.contrasenaActual) {
      showAlert("La nueva contraseña no puede ser igual a la actual", "error");
      return;
    }

    // Validar contraseña segura
    if (!validarContrasenaSegura(formData.nuevaContrasena)) {
      showAlert("La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial", "error");
      return;
    }
    
    // Validar que las contraseñas coincidan
    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      showAlert("Las contraseñas no coinciden", "error");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        showAlert("No se encontraron credenciales de autenticación", "error");
        setSubmitting(false);
        return;
      }

      // Ajustar la URL y el cuerpo según la ruta del backend para guía
      await axios.patch(
        `http://localhost:10101/guia/cambiar-contrasenia/${formData.cedula}`,
        {
          contrasenaActual: formData.contrasenaActual,
          contrasenia: formData.nuevaContrasena
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      showAlert("Contraseña actualizada exitosamente", "success");
      
      // Limpiar el formulario
      setFormData({
        cedula: "",
        contrasenaActual: "",
        nuevaContrasena: "",
        confirmarContrasena: ""
      });
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/VistaGuia/PerfilGuia");
      }, 2000);
      
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      
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
      setSubmitting(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    
    if (type === "success") {
      setTimeout(() => {
        setAlert({ show: false, message: "", type: "" });
      }, 3000);
    }
  };

  const closeAlert = () => {
    setAlert({ show: false, message: "", type: "" });
  };

  // Componente de Alerta
  const AlertComponent = () => {
    if (!alert.show) return null;
    
    const bgColor = alert.type === "success" ? "bg-green-500" : "bg-red-500";
    const Icon = alert.type === "success" ? CheckCircle : AlertCircle;
    
    return (
      <div className={`${bgColor} text-white p-4 rounded-lg mb-4 flex items-start`}>
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
        <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-8 shadow-lg max-w-5xl mx-auto`}>
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mr-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Cambiar Contraseña
            </h2>
          </div>
          
          <AlertComponent />
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showPassword.actual ? "text" : "password"}
                    name="contrasenaActual"
                    value={formData.contrasenaActual}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('actual')}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {showPassword.actual ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword.nueva ? "text" : "password"}
                    name="nuevaContrasena"
                    value={formData.nuevaContrasena}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('nueva')}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {showPassword.nueva ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirmar ? "text" : "password"}
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmar')}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {showPassword.confirmar ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Requisitos de contraseña */}
            <div className={`mt-8 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Requisitos de la contraseña:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p className={`flex items-center ${requisitosContrasena.longitud ? 'text-green-500' : 'text-red-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${requisitosContrasena.longitud ? 'opacity-100' : 'opacity-50'}`} />
                  8 caracteres
                </p>
                <p className={`flex items-center ${requisitosContrasena.mayuscula ? 'text-green-500' : 'text-red-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${requisitosContrasena.mayuscula ? 'opacity-100' : 'opacity-50'}`} />
                  Al menos una mayúscula
                </p>
                <p className={`flex items-center ${requisitosContrasena.minuscula ? 'text-green-500' : 'text-red-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${requisitosContrasena.minuscula ? 'opacity-100' : 'opacity-50'}`} />
                  Al menos una minúscula
                </p>
                <p className={`flex items-center ${requisitosContrasena.numero ? 'text-green-500' : 'text-red-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${requisitosContrasena.numero ? 'opacity-100' : 'opacity-50'}`} />
                  Al menos un número
                </p>
                <p className={`flex items-center ${requisitosContrasena.especial ? 'text-green-500' : 'text-red-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${requisitosContrasena.especial ? 'opacity-100' : 'opacity-50'}`} />
                  Al menos un carácter especial (!@#$%^&*)
                </p>
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
                disabled={submitting || !cambiosRealizados || !Object.values(requisitosContrasena).every(Boolean)}
                className={`py-2 px-6 ${
                  cambiosRealizados && Object.values(requisitosContrasena).every(Boolean)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-500'
                } text-white rounded-lg flex items-center gap-2 ${
                  (submitting || !cambiosRealizados || !Object.values(requisitosContrasena).every(Boolean))
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
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Cambiar Contraseña
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayoutGuia>
  );
};

export default CambiarContraseña;