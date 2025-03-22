import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayoutAdmin from "../../../layouts/DashboardLayoutAdmin";
import { Eye, EyeOff, Mail, User, Key, Shield, Edit, Clock } from "lucide-react";
import Swal from "sweetalert2";

const PerfilAdmin = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  });
  const [showPassword, setShowPassword] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });
  const [requisitosContrasena, setRequisitosContrasena] = useState({
    longitud: false,
    mayuscula: false,
    minuscula: false,
    numero: false,
    especial: false
  });
  const navigate = useNavigate();

  // Imagen por defecto (cambiada a una estática)
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/5556/5556468.png";

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    axios.get('http://localhost:10101/administrador', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Datos del administrador:", response.data);
      setAdmin(response.data);
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos del administrador");
      setLoading(false);
    });
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'nuevaContrasena') {
      verificarRequisitos(value);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setUpdating(true);

    // Validaciones iniciales
    const token = localStorage.getItem("token");
    const adminData = Array.isArray(admin) ? admin[0] : admin;
    const email = adminData?.email;

    if (!token || !email) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontraron las credenciales necesarias. Por favor, inicie sesión nuevamente.",
      });
      setUpdating(false);
      return;
    }

    // Validaciones de contraseña
    if (passwordForm.nuevaContrasena === passwordForm.contrasenaActual) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La nueva contraseña no puede ser igual a la actual",
      });
      setUpdating(false);
      return;
    }

    if (passwordForm.nuevaContrasena !== passwordForm.confirmarContrasena) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
      });
      setUpdating(false);
      return;
    }

    try {
      console.log('Enviando petición con email:', email);

      // Cambiar contraseña
      const response = await axios.patch(
        `http://localhost:10101/administrador/cambiarcontrasenia/${email}`,
        {
          contrasenia: passwordForm.nuevaContrasena,
          contrasenaActual: passwordForm.contrasenaActual
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Contraseña actualizada correctamente",
        });

        // Limpiar el formulario
        setPasswordForm({
          contrasenaActual: '',
          nuevaContrasena: '',
          confirmarContrasena: ''
        });
        setIsEditingPassword(false);
      }

    } catch (error) {
      console.error("Error completo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || 
              "Error al actualizar la contraseña. Verifique sus credenciales.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No se encontró el token de autenticación");
      setUpdating(false);
      return;
    }

    try {
      const response = await axios.patch(
        'http://localhost:10101/administrador/cambiar-correo',
        { email: newEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "¡Correo actualizado!",
          text: "Tu correo ha sido actualizado correctamente",
          confirmButtonColor: "#3085d6"
        });
        setIsEditingEmail(false);
        // Actualizar el estado del admin con el nuevo correo
        setAdmin(prev => ({
          ...prev,
          email: newEmail
        }));
      }
    } catch (error) {
      console.error("Error al actualizar correo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Ha ocurrido un error al actualizar el correo"
      });
    } finally {
      setUpdating(false);
    }
  };
  
  // Función para obtener iniciales del nombre (como en PerfilOperador)
  const obtenerIniciales = (adminData) => {
    return "A";  // Por defecto "A" de Admin
  };

  const renderContenido = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[75vh] px-3 sm:px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 text-center max-w-2xl">
            <div className="animate-pulse">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <div className="w-12 h-12 bg-teal-200 rounded-full"></div>
              </div>
              <div className="h-4 bg-teal-100 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-teal-100 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-teal-100 rounded w-2/3 mx-auto"></div>
            </div>
            <p className="mt-4 text-teal-600">Cargando perfil...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex justify-center items-center min-h-[75vh] px-3 sm:px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 text-center max-w-2xl">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-full h-full bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-2xl sm:text-4xl">!</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">Error al cargar el perfil</h2>
            <p className="text-red-500 mb-6 sm:mb-8 px-4 sm:px-6 text-sm sm:text-base">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-teal-200/50 text-sm sm:text-base"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    // Si no hay datos, mostrar un mensaje
    if (!admin) {
      return (
        <div className="flex justify-center items-center min-h-[75vh] px-3 sm:px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 text-center max-w-2xl">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <User size={30} className="text-teal-300 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Información no disponible</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">No se encontraron datos del administrador.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-teal-200/50 text-sm sm:text-base"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    
    // Verificamos si admin es un array o un objeto
    const adminData = Array.isArray(admin) ? admin[0] : admin;
    
    // Generar un nombre para el avatar a partir del email si no hay nombre
    const emailName = adminData.email ? adminData.email.split('@')[0] : "admin";
    
    return (
      <div className="p-3 sm:p-4 md:p-6">
        {/* Card principal con diseño innovador */}
        <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          {/* Header con estilo moderno */}
          <div className="bg-teal-600 p-4 sm:p-6 text-white relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 right-20 sm:right-40 w-20 sm:w-40 h-20 sm:h-40 rounded-full bg-teal-500 opacity-20 blur-xl"></div>
              <div className="absolute bottom-0 right-10 sm:right-20 w-30 sm:w-60 h-30 sm:h-60 rounded-full bg-teal-400 opacity-10 blur-2xl"></div>
              <div className="absolute top-5 left-1/2 w-10 sm:w-20 h-10 sm:h-20 rounded-full bg-teal-300 opacity-20 blur-md"></div>
            </div>
            
            {/* Título con estilo */}
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Mi Perfil</h1>
            </div>
          </div>

          {/* Contenido del perfil */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-8">
              {/* Columna izquierda: Foto y datos básicos */}
              <div className="w-full lg:w-1/3">
                {/* Tarjeta de perfil con efectos visuales */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6 transform hover:scale-[1.01] transition-all duration-300">
                  {/* Foto de perfil con efecto glowing */}
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-600 to-teal-400 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative rounded-full overflow-hidden border-4 border-white">
                        <img 
                          src={defaultAvatar} 
                          alt="Perfil administrador"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* Nombre y cargo con espaciado mejorado */}
                    <div className="mt-3 sm:mt-4">
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
                        Administrador
                      </h2>
                      <div className="flex items-center justify-center mt-1">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-teal-100 text-teal-700 rounded-full text-xs sm:text-sm font-medium">
                          Administrador del Sistema
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Datos de contacto con iconos y mejores espaciados */}
                  <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-teal-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-teal-100 hover:shadow-md border border-teal-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                        <Mail size={16} className="sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-teal-700 font-medium">Correo Electrónico</p>
                        <p className="text-gray-700 text-xs sm:text-sm">{adminData.email || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-teal-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-teal-100 hover:shadow-md border border-teal-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                        <Shield size={16} className="sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-teal-700 font-medium">Rol</p>
                        <p className="text-gray-700 text-xs sm:text-sm">Administrador</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones con diseño mejorado */}
                  <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                    <button 
                      onClick={() => setIsEditingEmail(true)}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-teal-600 to-teal-500 rounded-lg sm:rounded-xl text-white font-medium flex items-center justify-center gap-1 sm:gap-2 hover:from-teal-700 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-teal-200/50 text-sm"
                    >
                      <Edit size={16} className="sm:w-5 sm:h-5" />
                      Editar correo
                    </button>
                    <button 
                      onClick={() => setIsEditingPassword(true)}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-teal-500 to-teal-400 rounded-lg sm:rounded-xl text-white font-medium flex items-center justify-center gap-1 sm:gap-2 hover:from-teal-600 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-teal-200/50 text-sm"
                    >
                      <Key size={16} className="sm:w-5 sm:h-5" />
                      Cambiar contraseña
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Columna derecha: Formularios de edición y otros detalles */}
              <div className="w-full lg:w-2/3 space-y-4 sm:space-y-6">
                {/* Formulario de edición de correo */}
                {isEditingEmail && (
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-3 sm:mb-5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2 sm:mr-3">
                        <Mail size={16} className="sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-teal-700">
                        Actualizar Correo Electrónico
                      </h3>
                    </div>
                    
                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Correo Electrónico</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full p-3 rounded-lg bg-teal-50 text-gray-800 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="nuevo@ejemplo.com"
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingEmail(false)}
                          className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={updating}
                          className="py-2 px-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-lg transition-all duration-300"
                        >
                          {updating ? "Actualizando..." : "Guardar"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Formulario de cambio de contraseña */}
                {isEditingPassword && (
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-3 sm:mb-5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2 sm:mr-3">
                        <Key size={16} className="sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-teal-700">
                        Cambiar Contraseña
                      </h3>
                    </div>
                    
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                        <div className="relative">
                          <input
                            type={showPassword.actual ? "text" : "password"}
                            name="contrasenaActual"
                            value={passwordForm.contrasenaActual}
                            onChange={handlePasswordChange}
                            className="w-full p-3 rounded-lg bg-teal-50 text-gray-800 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("actual")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword.actual ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPassword.nueva ? "text" : "password"}
                            name="nuevaContrasena"
                            value={passwordForm.nuevaContrasena}
                            onChange={handlePasswordChange}
                            className="w-full p-3 rounded-lg bg-teal-50 text-gray-800 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("nueva")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword.nueva ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        
                        {/* Requisitos de contraseña */}
                        <div className="mt-2 p-3 bg-teal-50 rounded-lg">
                          <p className="text-sm font-medium text-teal-700 mb-2">Requisitos:</p>
                          <ul className="space-y-1">
                            {Object.entries(requisitosContrasena).map(([req, cumple]) => (
                              <li key={req} className={`flex items-center text-xs ${cumple ? 'text-green-600' : 'text-gray-500'}`}>
                                <div className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${cumple ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPassword.confirmar ? "text" : "password"}
                            name="confirmarContrasena"
                            value={passwordForm.confirmarContrasena}
                            onChange={handlePasswordChange}
                            className="w-full p-3 rounded-lg bg-teal-50 text-gray-800 border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("confirmar")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword.confirmar ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {passwordForm.confirmarContrasena && (
                          <p className={`text-xs mt-1 ${
                            passwordForm.nuevaContrasena === passwordForm.confirmarContrasena
                              ? "text-green-600"
                              : "text-red-500"
                          }`}>
                            {passwordForm.nuevaContrasena === passwordForm.confirmarContrasena
                              ? "Las contraseñas coinciden"
                              : "Las contraseñas no coinciden"}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingPassword(false)}
                          className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={updating}
                          className="py-2 px-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-lg transition-all duration-300"
                        >
                          {updating ? "Actualizando..." : "Guardar"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Tarjeta de información */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2 sm:mr-3">
                      <Shield size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-teal-700">
                      Información de la Cuenta
                    </h3>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-teal-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Como administrador, tienes acceso a todas las características y funcionalidades del sistema, 
                      incluyendo la gestión de operadores, servicios y configuraciones generales de la plataforma.
                    </p>
                  </div>
                </div>
                
                {/* Actividad de la cuenta */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-2 sm:mr-3">
                      <Clock size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-teal-700">
                      Actividad de la Cuenta
                    </h3>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-teal-50 rounded-lg sm:rounded-xl p-3 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">Última actualización</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-teal-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botón para ir al Dashboard */}
        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate("/VistaAdmin/Dashboard")}
            className="py-2 px-6 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all shadow-lg hover:shadow-teal-200/50 text-sm sm:text-base inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayoutAdmin>
      {renderContenido()}
    </DashboardLayoutAdmin>
  );
};

export default PerfilAdmin;