import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import DashboardLayoutAdmin from "../../../layouts/DashboardLayoutAdmin";
import { AlertCircle, CheckCircle, X, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import Swal from "sweetalert2";

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'nuevaContrasena') {
      verificarRequisitos(value);
    }

    // Verificar si hay cambios válidos
    const nuevaContrasenaDiferente = value !== formData.contrasenaActual;
    const confirmacionCorrecta = formData.confirmarContrasena === value;
    const contrasenaActualIngresada = formData.contrasenaActual !== "";
    
    setCambiosRealizados(
      nuevaContrasenaDiferente && 
      confirmacionCorrecta && 
      contrasenaActualIngresada
    );
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      if (!token || !email) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se encontraron credenciales de autenticación",
        });
        return;
      }

      // Verificar contraseña actual
      await axios.post(
        `http://localhost:10101/administrador/verificar-contrasena`,
        {
          email: email,
          contrasena: formData.contrasenaActual
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      // Cambiar contraseña - Actualizada la ruta para coincidir con el backend
      await axios.patch(
        `http://localhost:10101/administrador/cambiarcontrasenia/${email}`, // Ruta actualizada
        {
          contrasenia: formData.nuevaContrasena // Cambiado a 'contrasenia' para coincidir con el backend
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Contraseña actualizada correctamente",
      });

      // Limpiar el formulario
      setFormData({
        email: email,
        contrasenaActual: "",
        nuevaContrasena: "",
        confirmarContrasena: ""
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/VistaAdmin/PerfilAdmin");
      }, 2000);

    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al actualizar la contraseña",
      });
    } finally {
      setSubmitting(false);
    }
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
                  className="w-full p-3 rounded-lg bg-teal-800 text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  readOnly
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
                    {Object.entries(requisitosContrasena).map(([req, cumple]) => (
                      <li key={req} className={`flex items-center ${cumple ? 'text-green-400' : 'text-gray-300'}`}>
                        <div className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${cumple ? 'bg-green-500' : 'bg-gray-600'}`}>
                          {cumple ? '✓' : ''}
                        </div>
                        {req === 'longitud' ? 'Al menos 8 caracteres' :
                         req === 'mayuscula' ? 'Al menos una mayúscula' :
                         req === 'minuscula' ? 'Al menos una minúscula' :
                         req === 'numero' ? 'Al menos un número' :
                         'Al menos un carácter especial'}
                      </li>
                    ))}
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