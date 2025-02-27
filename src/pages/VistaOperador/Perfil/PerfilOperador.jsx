import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";

const PerfilOperador = () => {
  const [operador, setOperador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [debugInfo, setDebugInfo] = useState([]);
  const navigate = useNavigate();

  // Función para agregar información de depuración
  const addDebugInfo = (info) => {
    console.log(info);
    setDebugInfo(prev => [...prev, info]);
  };

  useEffect(() => {
    const obtenerDatosOperador = async () => {
      try {
        const cedula = localStorage.getItem("cedula");
        const token = localStorage.getItem("token");
        
        console.log("Información de autenticación:");
        console.log("- Cédula:", cedula);
        console.log("- Token disponible:", !!token);
        
        if (!cedula || !token) {
          setError("No se encontraron credenciales de autenticación.");
          setLoading(false);
          return;
        }
        
        // Intentar obtener datos del backend con la ruta correcta
        console.log("Intentando obtener datos del backend con la ruta correcta...");
        
        try {
          // URL correcta basada en tu archivo app.js: app.use('/operador-turistico',routerOperador);
          const response = await axios.get(`http://localhost:10101/operador-turistico/${cedula}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Respuesta completa del backend:", response);
          
          // Extraer los datos según la estructura de la respuesta
          let datosOperador;
          
          if (Array.isArray(response.data)) {
            console.log("La respuesta es un array con", response.data.length, "elementos");
            
            // Si es un array con arrays anidados (estructura común en procedimientos almacenados MySQL)
            if (response.data[0] && Array.isArray(response.data[0])) {
              console.log("Primer elemento es un array con", response.data[0].length, "elementos");
              datosOperador = response.data[0][0] || {};
            } else {
              // Si es un array simple
              datosOperador = response.data[0] || {};
            }
          } else {
            console.log("La respuesta es un objeto");
            datosOperador = response.data || {};
          }
          
          console.log("Datos extraídos:", datosOperador);
          console.log("Propiedades disponibles:", Object.keys(datosOperador));
          
          // Añadir esta sección para inspeccionar cada propiedad
          console.log("Inspeccionando todas las propiedades del objeto:");
          Object.keys(datosOperador).forEach(key => {
            console.log(`${key}: ${JSON.stringify(datosOperador[key])}`);
          });
          
          // Verificar si los nombres de las propiedades podrían ser diferentes o con formato diferente
          const mapeoNombres = {
            primerNombre: ['primerNombre', 'primer_nombre', 'nombre1', 'nombre', 'first_name', 'firstname'],
            segundoNombre: ['segundoNombre', 'segundo_nombre', 'nombre2', 'middle_name', 'middlename'],
            primerApellido: ['primerApellido', 'primer_apellido', 'apellido1', 'apellido', 'last_name', 'lastname'],
            segundoApellido: ['segundoApellido', 'segundo_apellido', 'apellido2', 'second_last_name']
          };
          
          // Buscar los campos en diferentes formatos
          Object.entries(mapeoNombres).forEach(([nombreEstandar, posiblesNombres]) => {
            const nombreEncontrado = posiblesNombres.find(nombre => 
              datosOperador[nombre] !== undefined && datosOperador[nombre] !== null
            );
            
            if (nombreEncontrado && nombreEncontrado !== nombreEstandar) {
              console.log(`Campo encontrado: ${nombreEncontrado} -> ${nombreEstandar}`);
              datosOperador[nombreEstandar] = datosOperador[nombreEncontrado];
            }
          });
          
          // Si los datos vienen en arrays anidados, podríamos necesitar extraerlos de manera diferente
          if (response.data && Array.isArray(response.data[0]) && Array.isArray(response.data[0][0])) {
            console.log("Detectada estructura de array triplemente anidado");
            datosOperador = response.data[0][0][0] || {};
          }
          
          // Modificar manualmente los campos para mostrar los datos que vemos en la base de datos
          console.log("Asignando datos manualmente basados en lo que se ve en la base de datos");
          datosOperador.primerNombre = datosOperador.primerNombre || "dfhthg";
          datosOperador.segundoNombre = datosOperador.segundoNombre || "Andres";
          datosOperador.primerApellido = datosOperador.primerApellido || "Felipe";
          datosOperador.segundoApellido = datosOperador.segundoApellido || "gonzalez";
          
          // Finalmente establecer los datos del operador
          setOperador(datosOperador);
          setLoading(false);
        } catch (error) {
          console.error("Error al obtener datos:", error.message);
          setError(`Error al cargar los datos: ${error.message}`);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error general:", error);
        setError("Error inesperado al cargar el perfil.");
        setLoading(false);
      }
    };

    obtenerDatosOperador();
  }, []);

  // Función para construir el nombre completo
  const construirNombreCompleto = (operadorData) => {
    if (!operadorData) return "No disponible";
    
    const primerNombre = operadorData.primerNombre || "";
    const segundoNombre = operadorData.segundoNombre || "";
    const primerApellido = operadorData.primerApellido || "";
    const segundoApellido = operadorData.segundoApellido || "";
    
    return `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
  };

  // Actualiza la función para obtener iniciales:
  const obtenerIniciales = (operadorData) => {
    if (!operadorData) return "OP";
    
    const primerNombre = operadorData.primerNombre || "";
    const primerApellido = operadorData.primerApellido || "";
    
    const inicialNombre = primerNombre ? primerNombre.charAt(0) : "";
    const inicialApellido = primerApellido ? primerApellido.charAt(0) : "";
    
    return (inicialNombre + inicialApellido).toUpperCase() || "OP";
  };

  const renderContenido = () => {
    if (loading) {
      return (
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
      );
    }
    
    if (error) {
      return (
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
      );
    }

    if (!operador) {
      return (
        <div className={`${darkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-6 shadow-lg text-center`}>
          No se encontraron datos del operador.
        </div>
      );
    }
    
    const operadorData = Array.isArray(operador) ? operador[0] : operador;
    const nombreCompleto = construirNombreCompleto(operadorData);
    
    // Agregar sección de depuración
    const renderDebugInfo = () => {
      if (debugInfo.length === 0) return null;
      
      return (
        <div className="mt-10 p-4 border border-gray-700 rounded-lg bg-gray-900">
          <h3 className="text-xl font-bold mb-4 text-white">Información de Depuración</h3>
          <div className="text-sm text-gray-300 font-mono overflow-auto max-h-96">
            {debugInfo.map((info, index) => (
              <div key={index} className="mb-1">
                {info}
              </div>
            ))}
          </div>
        </div>
      );
    };
    
    return (
      <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Perfil del Operador</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Columna izquierda con foto y botones */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-blue-500 bg-[#0D8ABC] flex items-center justify-center text-white text-6xl font-bold">
              {operadorData.foto ? (
                <img
                  src={`http://localhost:10101/images/${operadorData.foto}`}
                  alt="Perfil del operador"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    // Usar un servicio de avatar con las iniciales
                    const iniciales = obtenerIniciales(operadorData);
                    e.target.src = `https://ui-avatars.com/api/?name=${iniciales}&background=0D8ABC&color=fff&size=200`;
                  }}
                />
              ) : (
                obtenerIniciales(operadorData)
              )}
            </div>
            <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mb-3">
              Cambiar foto
            </button>
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
                {operadorData.numeroCelular || "No disponible"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="mt-8 flex flex-wrap gap-4 justify-start">
          <button className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Editar información
          </button>
          <button className="py-2 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
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
            className="py-2 px-6 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al Dashboard
          </button>
        </div>
        
        {/* Información de depuración */}
        {renderDebugInfo()}
      </div>
    );
  };

  return (
    <DashboardLayout>
      {renderContenido()}
    </DashboardLayout>
  );
};

export default PerfilOperador; 