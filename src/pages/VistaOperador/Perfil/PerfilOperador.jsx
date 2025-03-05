import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";

const PerfilOperador = () => {
  const [operador, setOperador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [fotoPerfil, setFotoPerfil] = useState(localStorage.getItem('fotoPerfilURL') || null);
  const navigate = useNavigate();

  // Función para obtener iniciales para el avatar
  const obtenerIniciales = (operadorData) => {
    if (!operadorData) return "OP";
    
    const primerNombre = operadorData.primerNombre || "";
    const primerApellido = operadorData.primerApellido || "";
    
    const inicialNombre = primerNombre ? primerNombre.charAt(0) : "";
    const inicialApellido = primerApellido ? primerApellido.charAt(0) : "";
    
    return (inicialNombre + inicialApellido).toUpperCase() || "OP";
  };

  // Función para construir nombre completo
  const construirNombreCompleto = (operadorData) => {
    if (!operadorData) return "Operador";
    
    const primerNombre = operadorData.primerNombre || "";
    const segundoNombre = operadorData.segundoNombre || "";
    const primerApellido = operadorData.primerApellido || "";
    const segundoApellido = operadorData.segundoApellido || "";
    
    return `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
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
            datosOperador.numeroCelular = datosOperador.numeroCelular || datosOperador.numero_celular || "";
            
            // Guardar los datos del operador
            setOperador(datosOperador);
            
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

  // Añadir este useEffect para manejar la actualización de fotos
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
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className={`${darkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-6 shadow-lg text-center`}>
          <div className="animate-pulse">
            <div className="flex justify-center">
              <div className="rounded-full bg-gray-700 h-32 w-32 mb-4"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto"></div>
          </div>
          <p className="mt-4">Cargando perfil...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg text-center text-red-500`}>
          <p className="text-xl font-semibold mb-2">Error al cargar el perfil</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Si no hay datos, mostrar un mensaje
  if (!operador) {
    return (
      <DashboardLayout>
        <div className={`${darkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-6 shadow-lg text-center`}>
          No se encontraron datos del operador.
        </div>
      </DashboardLayout>
    );
  }
  
  // Verificamos si operador es un array o un objeto
  const operadorData = Array.isArray(operador) ? operador[0] : operador;
  
  console.log("Datos del operador para renderizar:", operadorData);
  console.log("Número de teléfono:", operadorData.numeroCelular);
  
  // Mostrar los datos tal como vienen de la base de datos
  return (
    <DashboardLayout>
      <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Perfil del Operador</h2>
        
    
        <div className="flex flex-col md:flex-row gap-8">
          {/* Columna izquierda con foto */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-blue-500 bg-[#0D8ABC] flex items-center justify-center text-white text-6xl font-bold">
              {fotoPerfil ? (
                <img
                  src={fotoPerfil}
                  alt="Perfil del operador"
                  className="h-full w-full object-cover"
                  key={fotoPerfil}
                />
              ) : (
                obtenerIniciales(operadorData)
              )}
            </div>
          </div>
          
          {/* Columna derecha con información */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>PRIMER NOMBRE</h3>
              <p className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {operadorData.primerNombre || "No disponible"}
              </p>
            </div>
            
            <div>
              <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>SEGUNDO NOMBRE</h3>
              <p className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {operadorData.segundoNombre || "No disponible"}
              </p>
            </div>
            
            <div>
              <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>PRIMER APELLIDO</h3>
              <p className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {operadorData.primerApellido || "No disponible"}
              </p>
            </div>
            
            <div>
              <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>SEGUNDO APELLIDO</h3>
              <p className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {operadorData.segundoApellido || "No disponible"}
              </p>
            </div>
            
            <div>
              <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CÉDULA</h3>
              <p className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {operadorData.cedula || "No disponible"}
              </p>
            </div>
            
            <div>
              <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CORREO ELECTRÓNICO</h3>
              <p className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {operadorData.email || "No disponible"}
              </p>
            </div>
            
            <div>
              <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>TELÉFONO</h3>
              <p className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {operadorData.numeroCelular || operadorData.numero_celular || operadorData.telefono || "No disponible"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="mt-8 flex flex-wrap gap-4 justify-start">
          <button 
            onClick={() => navigate("/VistaOperador/perfil/actualizar")}
            className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Editar información
          </button>
          <button 
            onClick={() => navigate("/VistaOperador/perfil/cambiar-contrasena")}
            className="py-2 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Cambiar contraseña
          </button>
        </div>
        
        {/* Sección de estadísticas */}
        <div className="mt-10">
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Estadísticas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-900/50">
              <h4 className="text-sm uppercase mb-1 text-blue-300">Rutas creadas</h4>
              <p className="text-2xl font-bold text-white">24</p>
            </div>
            
            <div className="p-4 rounded-lg bg-green-900/50">
              <h4 className="text-sm uppercase mb-1 text-green-300">Guías asignados</h4>
              <p className="text-2xl font-bold text-white">8</p>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-900/50">
              <h4 className="text-sm uppercase mb-1 text-purple-300">Clientes registrados</h4>
              <p className="text-2xl font-bold text-white">156</p>
            </div>
          </div>
        </div>
        
        {/* Botón para volver al Dashboard */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => navigate("/VistaOperador")}
            className={`py-2 px-6 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${darkMode ? 'text-white' : 'text-gray-800'} font-medium transition-colors duration-200 flex items-center gap-2`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al Dashboard
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerfilOperador; 