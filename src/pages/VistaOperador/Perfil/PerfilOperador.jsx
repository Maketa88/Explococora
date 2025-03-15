import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { User, Mail, Phone, Edit, Key, Shield, Clock } from "lucide-react";

const PerfilOperador = () => {
  const [operadorData, setOperadorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(localStorage.getItem('fotoPerfilURL') || null);
  const [telefono, setTelefono] = useState(""); // Estado específico para el teléfono
  const navigate = useNavigate();

  const obtenerIniciales = (data) => {
    if (!data.primerNombre) return "U";
    return data.primerNombre.charAt(0).toUpperCase();
  };

  // Función específica para obtener el teléfono del operador
  const obtenerTelefonoOperador = async (idOperador) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      console.log("Obteniendo teléfono para operador ID:", idOperador);
      
      // Llamada directa a la tabla de teléfono usando el ID del operador
      const response = await axios.get(`http://localhost:10101/telefono/operador/${idOperador}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Respuesta de teléfono:", response.data);
      
      if (response.data && response.data.length > 0) {
        // Si se encuentra un número, actualizar el estado
        setTelefono(response.data[0].numeroCelular || response.data[0].numero_celular);
      }
    } catch (error) {
      console.error("Error al obtener teléfono:", error);
    }
  };

  useEffect(() => {
    const obtenerDatosOperador = async () => {
      try {
        const cedula = localStorage.getItem("cedula");
        const token = localStorage.getItem("token");
        
        if (!cedula || !token) {
          setError("No se encontraron credenciales de autenticación.");
          setLoading(false);
          return;
        }

        console.log("Obteniendo datos para cédula:", cedula);
        
        try {
          // Usar el endpoint de perfil completo para obtener todos los datos, incluyendo el teléfono
          const response = await axios.get(`http://localhost:10101/operador-turistico/perfil-completo/${cedula}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Respuesta completa del backend:", response);
          console.log("Datos recibidos:", JSON.stringify(response.data, null, 2));
          
          // Procesar la respuesta según su estructura
          let datosOperador = null;
          
          if (Array.isArray(response.data)) {
            console.log("La respuesta es un array con", response.data.length, "elementos");
            
            if (response.data.length > 0) {
              if (Array.isArray(response.data[0])) {
                console.log("El primer elemento es un array con", response.data[0].length, "elementos");
                
                if (response.data[0].length > 0) {
                  datosOperador = response.data[0][0];
                  console.log("Usando datos del primer elemento anidado:", datosOperador);
                }
              } else {
                datosOperador = response.data[0];
                console.log("Usando datos del primer elemento:", datosOperador);
              }
            }
          } else if (response.data && typeof response.data === 'object') {
            datosOperador = response.data;
            console.log("Usando datos del objeto de respuesta:", datosOperador);
          }
          
          // Asegurarse de que todos los campos necesarios existan
          if (datosOperador) {
            datosOperador.primerNombre = datosOperador.primerNombre || datosOperador.primer_nombre || "";
            datosOperador.segundoNombre = datosOperador.segundoNombre || datosOperador.segundo_nombre || "";
            datosOperador.primerApellido = datosOperador.primerApellido || datosOperador.primer_apellido || "";
            datosOperador.segundoApellido = datosOperador.segundoApellido || datosOperador.segundo_apellido || "";
            datosOperador.email = datosOperador.email || "";
            
            // Intentar obtener el número de teléfono de varias propiedades posibles
            const numeroTelefono = 
              datosOperador.numeroCelular || 
              datosOperador.numero_celular || 
              datosOperador.telefono || 
              datosOperador.numeroTelefono;
              
            if (numeroTelefono) {
              setTelefono(numeroTelefono);
            } else if (datosOperador.id || datosOperador.idOperadorTuristico) {
              // Si no encontramos el teléfono, pero tenemos el ID del operador, buscamos su teléfono específicamente
              const operadorId = datosOperador.id || datosOperador.idOperadorTuristico;
              await obtenerTelefonoOperador(operadorId);
            }
            
            // Guardar los datos del operador
            setOperadorData(datosOperador);
            
            // Verificar si hay una foto
            if (datosOperador.foto) {
              let fotoUrl;
              if (datosOperador.foto.startsWith('http')) {
                fotoUrl = datosOperador.foto;
              } else if (datosOperador.foto.includes('/uploads/images/')) {
                fotoUrl = `http://localhost:10101${datosOperador.foto}`;
              } else {
                fotoUrl = `http://localhost:10101/uploads/images/${datosOperador.foto}`;
              }
              
              setFotoPerfil(fotoUrl);
              localStorage.setItem('fotoPerfilURL', fotoUrl);
            }
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Error al obtener datos:", error);
          
          // Mostrar información detallada del error
          if (error.response) {
            console.error("Respuesta de error:", error.response.data);
            console.error("Estado HTTP:", error.response.status);
          } else if (error.request) {
            console.error("No se recibió respuesta:", error.request);
          } else {
            console.error("Error de configuración:", error.message);
          }
          
          setError(`Error al obtener datos: ${error.message}`);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error general:", error);
        setError(`Error general: ${error.message}`);
        setLoading(false);
      }
    };

    obtenerDatosOperador();

    // Escuchar el evento de actualización de perfil
    const handlePerfilActualizado = (event) => {
      console.log("Evento de actualización de perfil recibido:", event.detail);
      
      if (event.detail.foto) {
        console.log("Actualizando foto de perfil a:", event.detail.foto);
        setFotoPerfil(event.detail.foto);
      }
      
      // Recargar los datos completos
      obtenerDatosOperador();
    };
    
    window.addEventListener('perfilActualizado', handlePerfilActualizado);
    
    return () => {
      window.removeEventListener('perfilActualizado', handlePerfilActualizado);
    };
  }, []);

  useEffect(() => {
    // Cargar foto inicial desde localStorage
    const fotoGuardada = localStorage.getItem('fotoPerfilURL');
    if (fotoGuardada) {
      setFotoPerfil(fotoGuardada);
    }
    
    // Escuchar eventos de actualización de foto de perfil
    const handleFotoUpdate = (event) => {
      if (event.detail && event.detail.foto) {
        console.log("Actualizando foto de perfil desde evento:", event.detail.foto);
        setFotoPerfil(event.detail.foto);
      }
    };
    
    window.addEventListener('perfilActualizado', handleFotoUpdate);
    
    // Limpiar el listener al desmontar
    return () => {
      window.removeEventListener('perfilActualizado', handleFotoUpdate);
    };
  }, []);

  // Añadir esta función para cargar la foto desde el backend
  const cargarFotoPerfil = async () => {
    try {
      const cedula = localStorage.getItem("cedula");
      const token = localStorage.getItem("token");
      
      if (!cedula || !token) return;
      
      const response = await axios.get(`http://localhost:10101/operador-turistico/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          _t: new Date().getTime() // Evitar caché
        }
      });
      
      if (response.data) {
        const operadorData = Array.isArray(response.data) ? response.data[0] : response.data;
        
        if (operadorData.foto) {
          let fotoUrl;
          if (operadorData.foto.startsWith('http')) {
            fotoUrl = operadorData.foto;
          } else if (operadorData.foto.includes('/uploads/images/')) {
            fotoUrl = `http://localhost:10101${operadorData.foto}`;
          } else {
            fotoUrl = `http://localhost:10101/uploads/images/${operadorData.foto}`;
          }
          
          setFotoPerfil(fotoUrl);
          localStorage.setItem("fotoPerfilURL", fotoUrl);
        }
      }
    } catch (error) {
      console.error("Error al cargar foto de perfil:", error);
    }
  };

  // Llamar a esta función en el useEffect inicial
  useEffect(() => {
    cargarFotoPerfil();
    
    // También intentar obtener el teléfono directamente
    const obtenerTelefonoDirecto = async () => {
      try {
        const cedula = localStorage.getItem("cedula");
        const token = localStorage.getItem("token");
        
        if (!cedula || !token) return;
        
        // Llamada a un nuevo endpoint específico para teléfono usando la cédula
        const response = await axios.get(`http://localhost:10101/telefono/operador-cedula/${cedula}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log("Respuesta de teléfono directa:", response.data);
        
        if (response.data && response.data.length > 0) {
          // Si se encuentra un número, actualizar el estado
          setTelefono(response.data[0].numeroCelular || response.data[0].numero_celular);
        }
      } catch (error) {
        console.error("Error al obtener teléfono directo:", error);
      }
    };
    
    obtenerTelefonoDirecto();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[75vh] px-3 sm:px-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-emerald-500 to-emerald-700 animate-pulse relative">
              <div className="absolute -bottom-10 sm:-bottom-12 left-5 sm:left-10 w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-emerald-300 animate-pulse"></div>
            </div>
            <div className="p-6 sm:p-10 pt-12 sm:pt-16">
              <div className="ml-20 sm:ml-28 h-5 sm:h-6 bg-emerald-100 rounded-full w-32 sm:w-48 mb-2 sm:mb-4 animate-pulse"></div>
              <div className="ml-20 sm:ml-28 h-3 sm:h-4 bg-emerald-50 rounded-full w-24 sm:w-32 mb-8 sm:mb-10 animate-pulse"></div>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full">
                <div className="h-40 sm:h-52 bg-emerald-50 rounded-2xl animate-pulse"></div>
                <div className="h-40 sm:h-52 bg-emerald-50 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
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
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-emerald-200/50 text-sm sm:text-base"
            >
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Si no hay datos, mostrar un mensaje
  if (!operadorData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[75vh] px-3 sm:px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 text-center max-w-2xl">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <User size={30} className="text-emerald-300 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Información no disponible</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">No se encontraron datos del operador.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-emerald-200/50 text-sm sm:text-base"
            >
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6">
        {/* Card principal con diseño innovador */}
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          {/* Header con estilo moderno */}
          <div className="bg-emerald-600 p-4 sm:p-6 text-white relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 right-20 sm:right-40 w-20 sm:w-40 h-20 sm:h-40 rounded-full bg-emerald-500 opacity-20 blur-xl"></div>
              <div className="absolute bottom-0 right-10 sm:right-20 w-30 sm:w-60 h-30 sm:h-60 rounded-full bg-emerald-400 opacity-10 blur-2xl"></div>
              <div className="absolute top-5 left-1/2 w-10 sm:w-20 h-10 sm:h-20 rounded-full bg-emerald-300 opacity-20 blur-md"></div>
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
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative rounded-full overflow-hidden border-4 border-white">
                        {fotoPerfil ? (
                          <img
                            src={fotoPerfil}
                            alt="Perfil del operador"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl sm:text-5xl font-bold">
                            {obtenerIniciales(operadorData)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Nombre y cargo con espaciado mejorado */}
                    <div className="mt-3 sm:mt-4">
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                        {operadorData.primerNombre} {operadorData.primerApellido}
                      </h2>
                      <div className="flex items-center justify-center mt-1">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-medium">
                          Operador Turístico
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Datos de contacto con iconos y mejores espaciados */}
                  <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-emerald-100 hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Mail size={16} className="sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-emerald-700 font-medium">Correo Electrónico</p>
                        <p className="text-gray-700 text-xs sm:text-sm truncate">{operadorData.email || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-emerald-100 hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Phone size={16} className="sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Teléfono</p>
                        <p className="text-gray-700 text-xs sm:text-sm">{telefono || operadorData.numeroCelular || "No disponible"}</p>
                      </div>
                    </div>
                    
                    {/* Cédula del operador */}
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm hover:bg-emerald-100 hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <User size={16} className="sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Cédula</p>
                        <p className="text-gray-700 text-xs sm:text-sm">{localStorage.getItem("cedula") || operadorData.cedula || "No disponible"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones con diseño mejorado */}
                  <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                    <button 
                      onClick={() => navigate("/VistaOperador/perfil/actualizar")}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg sm:rounded-xl text-white font-medium flex items-center justify-center gap-1 sm:gap-2 hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-200/50 text-sm"
                    >
                      <Edit size={16} className="sm:w-5 sm:h-5" />
                      Editar información
                    </button>
                    <button 
                      onClick={() => navigate("/VistaOperador/perfil/cambiar-contrasena")}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg sm:rounded-xl text-white font-medium flex items-center justify-center gap-1 sm:gap-2 hover:from-emerald-600 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-200/50 text-sm"
                    >
                      <Key size={16} className="sm:w-5 sm:h-5" />
                      Cambiar contraseña
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Columna derecha: Información detallada */}
              <div className="w-full lg:w-2/3 space-y-4 sm:space-y-6">
                {/* Tarjeta de información personal */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-2 sm:mr-3">
                      <User size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-700">
                      Información Personal
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Primer Nombre</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{operadorData.primerNombre || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Segundo Nombre</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{operadorData.segundoNombre || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Primer Apellido</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{operadorData.primerApellido || "No disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="group">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-600 mb-1 group-hover:text-emerald-700 transition-colors">Segundo Apellido</h4>
                      <div className="p-2 sm:p-4 bg-emerald-100/70 rounded-lg sm:rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:shadow-md border border-emerald-200/50 transition-all duration-300">
                        <p className="text-gray-700 text-sm">{operadorData.segundoApellido || "No disponible"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tarjeta de seguridad de cuenta */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-2 sm:mr-3">
                      <Shield size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-700">
                      Seguridad de Cuenta
                    </h3>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 -mr-4 sm:-mr-6 -mt-4 sm:-mt-6 bg-emerald-100 rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                        <Mail size={16} className="sm:w-5 sm:h-5 text-emerald-600" />
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">Correo electrónico</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{operadorData.email || "No disponible"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 -mr-4 sm:-mr-6 -mt-4 sm:-mt-6 bg-emerald-100 rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                        <Key size={16} className="sm:w-5 sm:h-5 text-emerald-600" />
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">Contraseña</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">••••••••••</p>
                        </div>
                      </div>
                      <div className="ml-7 sm:ml-9 pl-2 sm:pl-3 mt-2 sm:mt-3 border-l-2 border-emerald-200">
                        <button 
                          onClick={() => navigate("/VistaOperador/perfil/cambiar-contrasena")}
                          className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          Cambiar contraseña
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Nueva sección: Información de la cuenta */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-2 sm:mr-3">
                      <Clock size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-700">
                      Actividad de la Cuenta
                    </h3>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">Última actualización</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500"></div>
                      </div>
                    </div>
                    
                    <div className="text-center mt-2 sm:mt-4">
                      <button 
                        onClick={() => navigate("/VistaOperador/perfil/actualizar")}
                        className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center"
                      >
                        <Edit size={14} className="sm:w-4 sm:h-4 mr-1" />
                        Actualizar información
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerfilOperador; 