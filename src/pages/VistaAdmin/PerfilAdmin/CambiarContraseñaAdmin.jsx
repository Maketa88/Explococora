import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import DashboardLayoutAdmin from "../../../layouts/DashboardLayoutAdmin";
import { AlertCircle, CheckCircle, X, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

const CambiarContraseñaAdmin = () => {
  const [formData, setFormData] = useState({
    email: '',
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

  // Cargar email desde localStorage al iniciar
  useEffect(() => {
    const emailAdmin = localStorage.getItem("email");
    if (emailAdmin) {
      setFormData(prev => ({ ...prev, email: emailAdmin }));
    }
  }, []);

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
    
    if (['nuevaContrasena', 'confirmarContrasena'].includes(name)) {
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
      const emailValido = nuevoEstado.email !== "";
      
      setCambiosRealizados(
        nuevaContrasenaDiferente && 
        confirmacionCorrecta && 
        contrasenaActualIngresada &&
        emailValido
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

      // Primero verificar la contraseña actual
      await axios.post(
        `http://localhost:10101/admin/verificar-contrasena`,
        {
          email: formData.email,
          contrasena: formData.contrasenaActual
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Si la verificación es exitosa, cambiar la contraseña
      await axios.patch(
        `http://localhost:10101/admin/cambiar-contrasenia/${formData.email}`,
        {
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
        email: formData.email,
        contrasenaActual: "",
        nuevaContrasena: "",
        confirmarContrasena: ""
      });
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/VistaAdmin/PerfilAdmin");
      }, 2000);
      
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      
      let errorMessage;
      
      switch (error.response?.status) {
        case 401:
          errorMessage = "Credenciales inválidas o contraseña actual incorrecta";
          break;
        case 403:
          errorMessage = "No tiene permisos para realizar esta acción";
          break;
        case 404:
          errorMessage = "Usuario no encontrado";
          break;
        case 400:
          errorMessage = error.response?.data?.message || "La nueva contraseña no cumple con los requisitos";
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
    <DashboardLayoutAdmin>
      <div className="p-6">
        <div className="bg-teal-900 rounded-lg p-8 shadow-lg max-w-5xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center mr-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Cambiar Contraseña
            </h2>
          </div>
          
          <AlertComponent />
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  readOnly={!!localStorage.getItem("email")}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showPassword.actual ? "text" : "password"}
                    name="contrasenaActual"
                    value={formData.contrasenaActual}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("actual")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
                  >
                    {showPassword.actual ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword.nueva ? "text" : "password"}
                    name="nuevaContrasena"
                    value={formData.nuevaContrasena}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("nueva")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
                  >
                    {showPassword.nueva ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Requisitos de contraseña */}
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-white">La contraseña debe contener:</p>
                  <ul className="text-xs space-y-1">
                    <li className={`flex items-center ${requisitosContrasena.longitud ? 'text-green-400' : 'text-gray-300'}`}>
                      <div className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${requisitosContrasena.longitud ? 'bg-green-500' : 'bg-gray-600'}`}>
                        {requisitosContrasena.longitud ? '✓' : ''}
                      </div>
                      Al menos 8 caracteres
                    </li>
                    <li className={`flex items-center ${requisitosContrasena.mayuscula ? 'text-green-400' : 'text-gray-300'}`}>
                      <div className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${requisitosContrasena.mayuscula ? 'bg-green-500' : 'bg-gray-600'}`}>
                        {requisitosContrasena.mayuscula ? '✓' : ''}
                      </div>
                      Al menos una mayúscula
                    </li>
                    <li className={`flex items-center ${requisitosContrasena.minuscula ? 'text-green-400' : 'text-gray-300'}`}>
                      <div className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${requisitosContrasena.minuscula ? 'bg-green-500' : 'bg-gray-600'}`}>
                        {requisitosContrasena.minuscula ? '✓' : ''}
                      </div>
                      Al menos una minúscula
                    </li>
                    <li className={`flex items-center ${requisitosContrasena.numero ? 'text-green-400' : 'text-gray-300'}`}>
                      <div className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${requisitosContrasena.numero ? 'bg-green-500' : 'bg-gray-600'}`}>
                        {requisitosContrasena.numero ? '✓' : ''}
                      </div>
                      Al menos un número
                    </li>
                    <li className={`flex items-center ${requisitosContrasena.especial ? 'text-green-400' : 'text-gray-300'}`}>
                      <div className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${requisitosContrasena.especial ? 'bg-green-500' : 'bg-gray-600'}`}>
                        {requisitosContrasena.especial ? '✓' : ''}
                      </div>
                      Al menos un carácter especial
                    </li>
                  </ul>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirmar ? "text" : "password"}
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmar")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
                  >
                    {showPassword.confirmar ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Indicador de coincidencia */}
                {formData.confirmarContrasena && (
                  <p className={`text-sm mt-1 ${
                    formData.nuevaContrasena === formData.confirmarContrasena
                      ? "text-green-400"
                      : "text-red-400"
                  }`}>
                    {formData.nuevaContrasena === formData.confirmarContrasena
                      ? "Las contraseñas coinciden"
                      : "Las contraseñas no coinciden"}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate("/VistaAdmin/PerfilAdmin")}
                className="py-2 px-6 bg-teal-700 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver
              </button>
              
              <button
                type="submit"
                disabled={submitting || !cambiosRealizados}
                className={`py-2 px-6 ${
                  cambiosRealizados 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-500'
                } text-white rounded-lg flex items-center gap-2 ${
                  !cambiosRealizados || submitting ? 'opacity-70 cursor-not-allowed' : ''
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
                  "Actualizar Contraseña"
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