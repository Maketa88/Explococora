import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { AlertCircle, CheckCircle, X, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

const CambiarContrasena = () => {
  const [formData, setFormData] = useState({
    contrasenaActual: "",
    nuevaContrasena: "",
    confirmarContrasena: ""
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
  const [contrasenaOriginal, setContrasenaOriginal] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Actualizar el estado del formulario
    setFormData(prev => {
      const nuevoEstado = {
        ...prev,
        [name]: value
      };
      
      // Verificar si hay cambios en la contraseña
      const nuevaContrasenaDiferente = 
        nuevoEstado.nuevaContrasena !== "" && 
        nuevoEstado.nuevaContrasena !== nuevoEstado.contrasenaActual;
      
      const confirmacionCorrecta = 
        nuevoEstado.confirmarContrasena !== "" && 
        nuevoEstado.nuevaContrasena === nuevoEstado.confirmarContrasena;
      
      const contrasenaActualIngresada = nuevoEstado.contrasenaActual !== "";
      
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      showAlert("Las contraseñas no coinciden", "error");
      return;
    }
    
    // Validar longitud mínima
    if (formData.nuevaContrasena.length < 6) {
      showAlert("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }
    
    // Validar que la nueva contraseña sea diferente a la actual
    if (formData.nuevaContrasena === formData.contrasenaActual) {
      showAlert("La nueva contraseña debe ser diferente a la actual", "error");
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
      
      // Enviar solicitud para cambiar contraseña
      await axios.patch(
        'http://localhost:10101/operador-turistico/cambiar-contrasena',
        {
          contrasenaActual: formData.contrasenaActual,
          nuevaContrasena: formData.nuevaContrasena
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
        contrasenaActual: "",
        nuevaContrasena: "",
        confirmarContrasena: ""
      });
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/VistaOperador/perfil");
      }, 2000);
      
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      
      if (error.response?.status === 401) {
        showAlert("La contraseña actual es incorrecta", "error");
      } else {
        showAlert(
          error.response?.data?.message || "Error al cambiar la contraseña", 
          "error"
        );
      }
      
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
    <DashboardLayout>
      <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg max-w-md mx-auto`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Cambiar Contraseña
        </h2>
        
        <AlertComponent />
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPassword.actual ? "text" : "password"}
                name="contrasenaActual"
                value={formData.contrasenaActual}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('actual')}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {showPassword.actual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword.nueva ? "text" : "password"}
                name="nuevaContrasena"
                value={formData.nuevaContrasena}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} pr-10`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('nueva')}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {showPassword.nueva ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword.confirmar ? "text" : "password"}
                name="confirmarContrasena"
                value={formData.confirmarContrasena}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmar')}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {showPassword.confirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <p className={`text-xs mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
            * Para cambiar la contraseña, debe ingresar su contraseña actual, una nueva contraseña diferente y confirmarla.
          </p>
          
          {/* Botones de acción */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigate("/VistaOperador/perfil")}
              className="py-2 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={submitting || !cambiosRealizados}
              className={`py-2 px-6 ${cambiosRealizados ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500'} text-white rounded-lg flex items-center gap-2 ${(submitting || !cambiosRealizados) ? 'opacity-70 cursor-not-allowed' : ''}`}
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
    </DashboardLayout>
  );
};

export default CambiarContrasena; 