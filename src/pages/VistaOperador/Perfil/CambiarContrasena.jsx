import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { CheckCircle, ArrowLeft, Eye, EyeOff, Lock, Shield, Key } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CambiarContrasena = () => {
  const [formData, setFormData] = useState({
    cedula: "",
    contrasenaActual: "",
    nuevaContrasena: "",
    confirmarContrasena: ""
  });
  const [showPassword, setShowPassword] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });
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
      especial: /[!@#$%^&*]/.test(contrasena)
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let valorValidado = value;
    
    if (name === 'cedula') {
      valorValidado = value.replace(/\D/g, '');
    } else if (['nuevaContrasena', 'confirmarContrasena'].includes(name)) {
      valorValidado = value.slice(0, 8);
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
    const tieneEspecial = /[!@#$%^&*]/.test(contrasena);
    
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

      // Ajustar la URL y el cuerpo según la ruta del backend
      await axios.patch(
        `https://servicio-explococora.onrender.com/operador-turistico/cambiar-contrasenia/${formData.cedula}`,
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
        navigate("/VistaOperador/perfil");
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
    <DashboardLayout>
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
      <div className="p-3 sm:p-4 md:p-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg max-w-4xl mx-auto relative overflow-hidden border border-emerald-100 mb-4">
          {/* Header verde */}
          <div className="absolute top-0 left-0 w-full h-16 sm:h-20 md:h-24 bg-emerald-700 rounded-t-xl sm:rounded-t-2xl"></div>
          
          {/* Contenido principal */}
          <div className="relative z-10">
            {/* Encabezado con icono */}
            <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-emerald-500 rounded-full opacity-30 blur"></div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Lock className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-700 text-center mb-1 sm:mb-2">Cambiar Contraseña</h2>
            <p className="text-emerald-600 text-center text-sm sm:text-base mb-4 sm:mb-6 md:mb-8">Actualiza tu contraseña de forma segura</p>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Campos de entrada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 md:p-6 border border-emerald-100">
                  <label className="block text-sm font-medium mb-1 sm:mb-2 text-gray-700">
                    Cédula
                  </label>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-3 rounded-lg bg-white border border-emerald-200 text-gray-900 text-sm sm:text-base placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 md:p-6 border border-emerald-100">
                  <label className="block text-sm font-medium mb-1 sm:mb-2 text-gray-700">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.actual ? "text" : "password"}
                      name="contrasenaActual"
                      value={formData.contrasenaActual}
                      onChange={handleInputChange}
                      className="w-full p-2 sm:p-3 rounded-lg bg-white border border-emerald-200 text-gray-900 text-sm sm:text-base placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('actual')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      {showPassword.actual ? <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 md:p-6 border border-emerald-100">
                  <label className="block text-sm font-medium mb-1 sm:mb-2 text-gray-700">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.nueva ? "text" : "password"}
                      name="nuevaContrasena"
                      value={formData.nuevaContrasena}
                      onChange={handleInputChange}
                      className="w-full p-2 sm:p-3 rounded-lg bg-white border border-emerald-200 text-gray-900 text-sm sm:text-base placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('nueva')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      {showPassword.nueva ? <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 md:p-6 border border-emerald-100">
                  <label className="block text-sm font-medium mb-1 sm:mb-2 text-gray-700">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirmar ? "text" : "password"}
                      name="confirmarContrasena"
                      value={formData.confirmarContrasena}
                      onChange={handleInputChange}
                      className="w-full p-2 sm:p-3 rounded-lg bg-white border border-emerald-200 text-gray-900 text-sm sm:text-base placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmar')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      {showPassword.confirmar ? <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Requisitos de contraseña */}
              <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 md:p-6 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  <h3 className="text-xs sm:text-sm font-medium text-emerald-700">
                    Requisitos de la contraseña
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className={`flex items-center gap-1 sm:gap-2 ${requisitosContrasena.longitud ? 'text-emerald-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${requisitosContrasena.longitud ? 'opacity-100' : 'opacity-50'}`} />
                    <span className="text-xs sm:text-sm">8 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-1 sm:gap-2 ${requisitosContrasena.mayuscula ? 'text-emerald-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${requisitosContrasena.mayuscula ? 'opacity-100' : 'opacity-50'}`} />
                    <span className="text-xs sm:text-sm">Al menos una mayúscula</span>
                  </div>
                  <div className={`flex items-center gap-1 sm:gap-2 ${requisitosContrasena.minuscula ? 'text-emerald-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${requisitosContrasena.minuscula ? 'opacity-100' : 'opacity-50'}`} />
                    <span className="text-xs sm:text-sm">Al menos una minúscula</span>
                  </div>
                  <div className={`flex items-center gap-1 sm:gap-2 ${requisitosContrasena.numero ? 'text-emerald-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${requisitosContrasena.numero ? 'opacity-100' : 'opacity-50'}`} />
                    <span className="text-xs sm:text-sm">Al menos un número</span>
                  </div>
                  <div className={`flex items-center gap-1 sm:gap-2 ${requisitosContrasena.especial ? 'text-emerald-600' : 'text-gray-500'} col-span-1 sm:col-span-2`}>
                    <CheckCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${requisitosContrasena.especial ? 'opacity-100' : 'opacity-50'}`} />
                    <span className="text-xs sm:text-sm">Al menos un carácter especial (!@#$%^&*)</span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col-reverse sm:flex-row justify-between sm:justify-end gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/VistaOperador/perfil")}
                  className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">Volver</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting || !cambiosRealizados || !Object.values(requisitosContrasena).every(Boolean)}
                  className={`w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 flex items-center justify-center gap-2 rounded-lg transition-colors text-white text-sm sm:text-base ${
                    cambiosRealizados && Object.values(requisitosContrasena).every(Boolean)
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-medium">Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium">Cambiar Contraseña</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CambiarContrasena; 