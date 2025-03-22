import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';
import { toast } from 'react-toastify';

const RutasAsignadas = () => {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerRutasAsignadas();
  }, []);

  const obtenerRutasAsignadas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No se ha encontrado el token de autenticación");
        setLoading(false);
        return;
      }

      // Endpoint para obtener todas las rutas asignadas al guía
      const response = await axios.get('http://localhost:10101/guia/mi-historial-rutas', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Log de la respuesta completa del API
      console.log("RESPUESTA RAW DEL API:", response);
      console.log("DATOS RESPUESTA COMPLETA:", JSON.stringify(response.data, null, 2));
      
      // Mejorar el manejo de la respuesta para asegurar que se procesen todas las rutas
      let rutasData = [];
      if (Array.isArray(response.data)) {
        console.log("Formato detectado: Array directo");
        rutasData = response.data;
      } else if (response.data && Array.isArray(response.data.rutas)) {
        console.log("Formato detectado: Array en propiedad 'rutas'");
        rutasData = response.data.rutas;
      } else if (response.data && typeof response.data === 'object' && response.data.data) {
        // En caso de que la respuesta esté en response.data.data
        console.log("Formato detectado: Objeto con propiedad 'data'");
        rutasData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (response.data && typeof response.data === 'object') {
        console.log("Formato detectado: Objeto único");
        rutasData = [response.data]; // Si es un único objeto
      }
      
      console.log("RUTAS PROCESADAS ANTES DE SETEAR:", rutasData);
      console.log("NÚMERO DE RUTAS ENCONTRADAS:", rutasData.length);
      
      // Log de cada ruta individual para ver estructura
      rutasData.forEach((ruta, index) => {
        console.log(`RUTA #${index + 1}:`, JSON.stringify(ruta, null, 2));
      });
      
      setRutas(rutasData);
      setLoading(false);
    } catch (err) {
      console.error("ERROR COMPLETO AL OBTENER RUTAS:", err);
      console.error("Detalles del error:", err.response ? err.response.data : err.message);
      setError("Error al cargar las rutas asignadas. Por favor, intente de nuevo más tarde.");
      setLoading(false);
      toast.error("No se pudieron cargar las rutas asignadas");
    }
  };

  // Función para formatear la fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "Fecha no disponible";
    
    try {
      // Asegurarse de que la fecha esté en formato ISO o sea un objeto Date válido
      const fecha = new Date(fechaStr);
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        // Intenta parsear formatos específicos si la fecha no es válida
        if (typeof fechaStr === 'string') {
          // Intentar con formato YYYY-MM-DD HH:MM:SS
          const match = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}):(\d{2}))?$/);
          if (match) {
            const [_, year, month, day, hour = 0, minute = 0, second = 0] = match;
            const parsedDate = new Date(year, month - 1, day, hour, minute, second);
            if (!isNaN(parsedDate.getTime())) {
              return new Intl.DateTimeFormat('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }).format(parsedDate);
            }
          }
        }
        return fechaStr; // Devolver la cadena original si no podemos parsearla
      }
      
      // Formato para mostrar día, mes, año, hora y minutos
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(fecha);
    } catch (e) {
      console.error("Error al formatear fecha:", e);
      return fechaStr; // Devolver la fecha original si hay error
    }
  };

  // Obtener el estado de la ruta con formato visual
  const getEstadoRuta = (estado) => {
    if (!estado) return { texto: "Desconocido", color: "gray" };
    
    const estadoLower = estado.toLowerCase();
    
    if (estadoLower.includes("complet") || estadoLower.includes("finaliz")) {
      return { texto: "Completada", color: "emerald" };
    } else if (estadoLower.includes("cancel")) {
      return { texto: "Cancelada", color: "red" };
    } else if (estadoLower.includes("pend")) {
      return { texto: "Pendiente", color: "yellow" };
    } else if (estadoLower.includes("progres") || estadoLower.includes("curso")) {
      return { texto: "En progreso", color: "blue" };
    } else if (estadoLower.includes("asign")) {
      return { texto: "Asignada", color: "purple" };
    } else {
      return { texto: estado, color: "gray" };
    }
  };

  const renderContenido = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex justify-center items-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-200 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full border-t-4 border-emerald-500 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
            <button
              onClick={obtenerRutasAsignadas}
              className="mt-4 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-md"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    if (!rutas || rutas.length === 0) {
      return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center py-10 sm:py-16">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No hay rutas asignadas</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              En este momento no tienes rutas asignadas. Cuando se te asigne una ruta, aparecerá en esta sección.
            </p>
            <button
              onClick={() => navigate("/VistaGuia/Dashboard")}
              className="py-2 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg transition-all shadow-md flex items-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Volver al Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {rutas.map((ruta, index) => {
          // Log detallado de cada ruta durante el render
          console.log(`RENDERIZANDO RUTA #${index + 1}:`, ruta);
          
          const estado = getEstadoRuta(ruta.estado || ruta.estadoRuta);
          console.log(`  - Estado detectado:`, estado);
          
          const colorClasses = {
            "emerald": "bg-emerald-100 text-emerald-800",
            "red": "bg-red-100 text-red-800",
            "yellow": "bg-yellow-100 text-yellow-800",
            "blue": "bg-blue-100 text-blue-800",
            "purple": "bg-purple-100 text-purple-800",
            "gray": "bg-gray-100 text-gray-800"
          };
          
          // Extraer información relevante de la ruta para mostrar
          const nombreRuta = ruta.nombreRuta || ruta.nombre || `Ruta #${ruta.idRuta || ruta.id || index + 1}`;
          const descripcion = ruta.descripcion || ruta.descripcionRuta || "Sin descripción disponible";
          const fechaInicio = formatearFecha(ruta.fechaInicio || ruta.fecha_inicio);
          const fechaFin = formatearFecha(ruta.fechaFin || ruta.fecha_fin);
          const duracion = ruta.duracion || ruta.duracionEstimada || 
                          (ruta.fechaInicio && ruta.fechaFin ? "Ver fechas" : "No especificada");
          const puntoEncuentro = ruta.puntoEncuentro || ruta.lugar || "No especificado";
          const participantes = ruta.cantidadPersonas || ruta.participantes || "No especificado";
          const radicado = ruta.radicado || "No disponible";
          
          console.log(`  - Datos extraídos:`, {
            nombreRuta,
            descripcion,
            fechaInicio,
            fechaFin,
            duracion, 
            puntoEncuentro,
            participantes,
            radicado,
            idReserva: ruta.idReserva,
            idRuta: ruta.idRuta || ruta.id,
            idCliente: ruta.idCliente
          });
          
          return (
            <div 
              key={ruta.idReserva || ruta.id || index} 
              className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 border border-emerald-100"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-800 mb-1">
                    {nombreRuta}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {descripcion}
                  </p>
                  {radicado && radicado !== "No disponible" && (
                    <p className="text-xs font-medium text-emerald-600 mt-1">
                      Radicado: {radicado}
                    </p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium mt-2 md:mt-0 inline-flex items-center ${colorClasses[estado.color]}`}>
                  <span className={`w-2 h-2 rounded-full bg-${estado.color}-500 mr-1.5`}></span>
                  {estado.texto}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 mb-1">Fecha inicio</p>
                  <p className="font-medium text-gray-800">
                    {fechaInicio}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 mb-1">Fecha fin</p>
                  <p className="font-medium text-gray-800">
                    {fechaFin}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 mb-1">Duración</p>
                  <p className="font-medium text-gray-800">
                    {duracion}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 mb-1">Punto de encuentro</p>
                  <p className="font-medium text-gray-800 truncate">
                    {puntoEncuentro}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {ruta.detalles && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                    {ruta.detalles}
                  </span>
                )}
                {ruta.dificultad && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                    Dificultad: {ruta.dificultad}
                  </span>
                )}
                {ruta.tipoRuta && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">
                    {ruta.tipoRuta}
                  </span>
                )}
                {participantes && (
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                    {typeof participantes === 'number' ? `${participantes} participantes` : participantes}
                  </span>
                )}
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {ruta.idReserva && (
                      <span className="inline-flex items-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Reserva: #{ruta.idReserva}
                      </span>
                    )}
                    {ruta.idCliente && (
                      <span className="inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Cliente: #{ruta.idCliente}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/VistaGuia/DetalleRuta/${ruta.idRuta || ruta.id || index}`)}
                    className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg transition-all shadow-md flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Ver detalles completos
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayoutGuia>
      <div className="p-3 sm:p-6">
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Mis Rutas Asignadas</h1>
              <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
                Visualiza todas las rutas que te han sido asignadas, su estado actual y detalles importantes.
              </p>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-4 sm:p-6">
            {renderContenido()}
          </div>
        </div>
      </div>
    </DashboardLayoutGuia>
  );
};

export default RutasAsignadas; 