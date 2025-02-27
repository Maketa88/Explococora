import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayoutGuia from "../../../layouts/DashboardLayoutGuia"; // Importando el componente de layout

const PerfilGuia = () => {
  const [guia, setGuia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true); // Por defecto modo oscuro como en el dashboard
  const navigate = useNavigate();

  useEffect(() => {
    // Detectar el modo actual del dashboard
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('light')) {
      setDarkMode(false);
    }

    const cedula = localStorage.getItem("cedula");
    const token = localStorage.getItem("token");

    if (!cedula) {
      setError("No se encontró la cédula del guia.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:10101/guia/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos del guia recibidos:", response.data);
        // Guardar los datos del guía
        setGuia(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error completo:", error);
        console.error("Status:", error.response?.status);
        console.error("Respuesta del servidor:", error.response?.data);
        setError(`Error: ${error.response?.data?.message || error.message}`);
        setLoading(false);
      });
  }, []);

  // Función para separar nombre si existe
  const separarNombre = (nombreCompleto) => {
    if (!nombreCompleto) return { nombres: "No disponible", apellidos: "No disponible" };
    
    const partes = nombreCompleto.split(" ");
    const nombres = partes.slice(0, 2).join(" ");
    const apellidos = partes.slice(2).join(" ");
    return { nombres, apellidos };
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

    // Si no hay datos, mostrar un mensaje
    if (!guia) {
      return (
        <div className={`${darkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-6 shadow-lg text-center`}>
          No se encontraron datos del guía.
        </div>
      );
    }
    
    // Verificamos si guia es un array o un objeto
    const guiaData = Array.isArray(guia) ? guia[0] : guia;
    
    // Extraer nombre
    const nombreCompleto = guiaData.nombre || guiaData.nombre_completo || guiaData.nombre_del_guia || "No disponible";
    const { nombres, apellidos } = separarNombre(nombreCompleto);
    
    return (
      <div className={`${darkMode ? 'bg-[#1e293b]' : 'bg-gray-100'} rounded-lg p-6 shadow-lg`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Perfil del Guía</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Imagen de perfil */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-blue-500">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&size=200&background=0D8ABC&color=fff`}
                alt="Perfil del guía"
                className="h-full w-full object-cover"
              />
            </div>
            <button className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium transition-colors duration-200`}>
              Cambiar foto
            </button>
          </div>
          
          {/* Información personal */}
          <div className="flex-1">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre</h3>
                <p className="font-medium text-lg">{nombres}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Apellidos</h3>
                <p className="font-medium text-lg">{apellidos}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cédula</h3>
                <p className="font-medium text-lg">{guiaData.cedula || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correo electrónico</h3>
                <p className="font-medium text-lg">{guiaData.email || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Teléfono</h3>
                <p className="font-medium text-lg">{guiaData.telefono || "No disponible"}</p>
              </div>
              
              <div>
                <h3 className={`text-sm uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Especialidad</h3>
                <p className="font-medium text-lg">{guiaData.especialidad || "No disponible"}</p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <button className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium transition-colors duration-200`}>
                Editar información
              </button>
              <button 
                onClick={() => navigate("/VistaGuia/CambiarContraseña")}
                className={`py-2 px-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${darkMode ? 'text-white' : 'text-gray-800'} font-medium transition-colors duration-200`}
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
        
        {/* Sección de estadísticas */}
        <div className="mt-8">
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Estadísticas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Rutas completadas</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-700'}`}>127</p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Valoración media</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-green-700'}`}>4.8/5.0</p>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <h4 className={`text-sm uppercase mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Clientes atendidos</h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-purple-700'}`}>350+</p>
            </div>
          </div>
        </div>
        
        {/* Botón para volver al Dashboard */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => navigate("/VistaGuia")}
            className={`py-2 px-6 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} ${darkMode ? 'text-white' : 'text-gray-800'} font-medium transition-colors duration-200 flex items-center gap-2`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  };

  // Envolver todo el componente con DashboardLayoutGuia
  return (
    <DashboardLayoutGuia>
      {renderContenido()}
    </DashboardLayoutGuia>
  );
};

export default PerfilGuia;