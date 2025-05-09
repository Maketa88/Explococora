import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';
import { toast } from 'react-toastify';

const RutasAsignadas = () => {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalDetails, setModalDetails] = useState(null);
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

      // Primero obtenemos el ID del guía actual
      let idGuiaActual;
      try {
        // Podemos decodificar el token JWT para obtener el ID del guía
        // Esto asume que el token tiene la información del usuario
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          idGuiaActual = payload.id || payload.userId || payload.guiaId;
          console.log("ID del guía actual:", idGuiaActual);
        }
        
        // Si no podemos obtener el ID del token, intentamos con una llamada al API
        if (!idGuiaActual) {
          const perfilResponse = await axios.get('https://servicio-explococora.onrender.com/guia/perfil', {
            headers: { Authorization: `Bearer ${token}` }
          });
          idGuiaActual = perfilResponse.data.id || perfilResponse.data.idGuia;
          console.log("ID del guía obtenido del perfil:", idGuiaActual);
        }
      } catch (err) {
        console.error("Error al obtener ID del guía:", err);
      }

      // Endpoint para obtener todas las rutas
      const response = await axios.get('https://servicio-explococora.onrender.com/guia/mi-historial-rutas', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("RESPUESTA RAW DEL API:", response);
      console.log("DATOS RESPUESTA COMPLETA:", JSON.stringify(response.data, null, 2));
      
      let rutasData = [];
      
      if (response.data) {
        // Caso 1: La respuesta es directamente un array de rutas
        if (Array.isArray(response.data)) {
          console.log("Formato detectado: Array directo");
          rutasData = response.data;
        }
        // Caso 2: La respuesta es un objeto con una propiedad "rutas" que es un array
        else if (response.data.rutas && Array.isArray(response.data.rutas)) {
          console.log("Formato detectado: Array en propiedad 'rutas'");
          rutasData = response.data.rutas;
        }
        // Caso 3: La respuesta es un objeto con una propiedad "data" que puede ser un array u objeto
        else if (response.data.data) {
          console.log("Formato detectado: Propiedad 'data'");
          if (Array.isArray(response.data.data)) {
            rutasData = response.data.data;
          } else if (typeof response.data.data === 'object') {
            rutasData = [response.data.data];
          }
        }
        // Caso 4: La respuesta contiene objetos con formato diferente en propiedades anidadas
        else if (typeof response.data === 'object') {
          console.log("Formato detectado: Objeto con posibles rutas anidadas");
          // Verificar si hay propiedades que podrían contener arrays de rutas
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`Encontrado array en propiedad '${key}'`);
              rutasData = [...rutasData, ...response.data[key]];
            } else if (typeof response.data[key] === 'object' && response.data[key] !== null) {
              // Si es un objeto pero no un array, podría ser una única ruta
              if (response.data[key].idRuta || response.data[key].id || 
                  response.data[key].nombreRuta || response.data[key].nombre) {
                console.log(`Encontrada posible ruta individual en '${key}'`);
                rutasData.push(response.data[key]);
              }
            }
          }
          
          // Si no se encontraron rutas en propiedades anidadas, tratar el objeto completo como una ruta
          if (rutasData.length === 0 && (response.data.idRuta || response.data.id || 
              response.data.nombreRuta || response.data.nombre)) {
            console.log("Formato detectado: Objeto único como ruta");
            rutasData = [response.data];
          }
        }
      }
      
      // Filtrar cualquier elemento null o undefined que pudiera haberse añadido
      rutasData = rutasData.filter(ruta => ruta !== null && ruta !== undefined);
      
      // Filtrar para mostrar solo las rutas asignadas al guía actual
      if (idGuiaActual) {
        console.log("Filtrando rutas para el guía con ID:", idGuiaActual);
        rutasData = rutasData.filter(ruta => {
          // Verificar todas las posibles propiedades donde podría estar el ID del guía
          const guiaId = ruta.idGuia || ruta.guiaId || 
                         (ruta.guia && ruta.guia.id) || 
                         (ruta.guia && ruta.guia.idGuia) ||
                         (ruta.asignaciones && ruta.asignaciones.idGuia);
          
          console.log(`Ruta ${ruta.id || ruta.idRuta || 'desconocida'} - ID del guía: ${guiaId}`);
          return guiaId == idGuiaActual; // Usar == en lugar de === porque los IDs podrían ser string o number
        });
      }
      
      console.log("RUTAS FILTRADAS PARA EL GUÍA ACTUAL:", rutasData);
      console.log("NÚMERO DE RUTAS ENCONTRADAS:", rutasData.length);
      
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

  // Función para mostrar el modal con los detalles
  const mostrarDetalles = (reserva) => {
    setModalDetails(reserva);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setModalDetails(null);
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

    // Procesamos las rutas para extraer todas las reservas
    let todasLasReservas = [];
    
    if (rutas && rutas.length > 0) {
      // Iteramos por cada ruta para extraer sus reservas
      rutas.forEach(ruta => {
        // Si la ruta tiene un array de reservas, las agregamos a nuestro array
        if (ruta.reservas && Array.isArray(ruta.reservas) && ruta.reservas.length > 0) {
          // Agregamos información de la ruta a cada reserva para mostrarla
          const reservasConDetallesRuta = ruta.reservas.map(reserva => ({
            ...reserva,
            rutaInfo: {
              idRuta: ruta.idRuta || ruta.id,
              nombreRuta: ruta.nombreRuta || ruta.nombre,
              descripcion: ruta.descripcion || ruta.descripcionRuta,
              duracion: ruta.duracion || ruta.duracionEstimada,
              dificultad: ruta.dificultad,
              puntoEncuentro: ruta.puntoEncuentro || ruta.lugar
            }
          }));
          
          todasLasReservas = [...todasLasReservas, ...reservasConDetallesRuta];
        } else {
          // Si la ruta no tiene reservas, la tratamos como una sola asignación
          todasLasReservas.push({
            idReserva: ruta.idReserva,
            estado: ruta.estado || ruta.estadoRuta,
            fechaInicio: ruta.fechaInicio || ruta.fecha_inicio,
            fechaFin: ruta.fechaFin || ruta.fecha_fin,
            cedulaCliente: ruta.cedulaCliente,
            nombreCliente: ruta.nombreCliente,
            rutaInfo: {
              idRuta: ruta.idRuta || ruta.id,
              nombreRuta: ruta.nombreRuta || ruta.nombre,
              descripcion: ruta.descripcion || ruta.descripcionRuta,
              duracion: ruta.duracion || ruta.duracionEstimada,
              dificultad: ruta.dificultad,
              puntoEncuentro: ruta.puntoEncuentro || ruta.lugar
            }
          });
        }
      });
    }
    
    console.log("TOTAL DE RESERVAS A MOSTRAR:", todasLasReservas.length);
    
    if (todasLasReservas.length === 0) {
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

    // Definir colorClasses aquí para que esté disponible en todo el renderContenido
    const colorClasses = {
      "emerald": "bg-emerald-100 text-emerald-800",
      "red": "bg-red-100 text-red-800",
      "yellow": "bg-yellow-100 text-yellow-800",
      "blue": "bg-blue-100 text-blue-800",
      "purple": "bg-purple-100 text-purple-800",
      "gray": "bg-gray-100 text-gray-800"
    };

    return (
      <div className="space-y-6">
        {console.log("RENDERIZANDO TOTAL DE RESERVAS:", todasLasReservas.length)}
        
        {todasLasReservas.map((reserva, index) => {
          // Log detallado de cada reserva durante el render
          console.log(`RENDERIZANDO RESERVA #${index + 1}:`, reserva);
          
          // Extraer información relevante de la reserva
          const estado = getEstadoRuta(reserva.estado);
          
          // Obtener información de la ruta asociada a la reserva
          const rutaInfo = reserva.rutaInfo || {};
          const nombreRuta = rutaInfo.nombreRuta || `Ruta #${rutaInfo.idRuta || index + 1}`;
          const descripcion = rutaInfo.descripcion || "Sin descripción disponible";
          const duracion = rutaInfo.duracion || "No especificada";
          const dificultad = rutaInfo.dificultad;
          const puntoEncuentro = rutaInfo.puntoEncuentro || "No especificado";
          
          // Formatear fechas
          const fechaInicio = formatearFecha(reserva.fechaInicio);
          const fechaFin = formatearFecha(reserva.fechaFin);
          
          return (
            <div 
              key={reserva.idReserva || index} 
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
                {reserva.nombreCliente && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                    Cliente: {reserva.nombreCliente}
                  </span>
                )}
                {dificultad && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                    Dificultad: {dificultad}
                  </span>
                )}
                {reserva.cedulaCliente && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">
                    Cédula: {reserva.cedulaCliente}
                  </span>
                )}
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                  </div>
                  <button 
                    onClick={() => mostrarDetalles(reserva)}
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
        
        {/* Modal de detalles flotante */}
        {modalDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-emerald-600 text-white p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {modalDetails.rutaInfo?.nombreRuta || `Ruta #${modalDetails.rutaInfo?.idRuta || ''}`}
                </h3>
                <button 
                  onClick={cerrarModal}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {/* Resumen de la reserva */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${colorClasses[getEstadoRuta(modalDetails.estado).color]}`}>
                      <span className={`w-2 h-2 rounded-full bg-${getEstadoRuta(modalDetails.estado).color}-500 mr-1.5`}></span>
                      {getEstadoRuta(modalDetails.estado).texto}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {modalDetails.rutaInfo?.descripcion || "Sin descripción disponible"}
                  </p>
                </div>
                
                {/* Detalles completos */}
                <div className="bg-emerald-50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-emerald-800 mb-4">Información detallada</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primera columna */}
                    <div>
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-emerald-700 mb-1">Punto de encuentro</h5>
                        <p className="text-gray-800">
                          {modalDetails.rutaInfo?.puntoEncuentro || "No especificado"}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-emerald-700 mb-1">Dificultad</h5>
                        <p className="text-gray-800">
                          {modalDetails.rutaInfo?.dificultad || "No especificada"}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-emerald-700 mb-1">Duración</h5>
                        <p className="text-gray-800">
                          {modalDetails.rutaInfo?.duracion || "No especificada"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Segunda columna */}
                    <div>
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-emerald-700 mb-1">Fecha y hora de inicio</h5>
                        <p className="text-gray-800">
                          {formatearFecha(modalDetails.fechaInicio)}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-emerald-700 mb-1">Fecha y hora de finalización</h5>
                        <p className="text-gray-800">
                          {formatearFecha(modalDetails.fechaFin)}
                        </p>
                      </div>
                      
                      {modalDetails.nombreCliente && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-emerald-700 mb-1">Cliente</h5>
                          <p className="text-gray-800">
                            {modalDetails.nombreCliente}
                            {modalDetails.cedulaCliente && ` - Cédula: ${modalDetails.cedulaCliente}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Información adicional si está disponible */}
                {Object.keys(modalDetails).filter(key => 
                  !['idReserva', 'estado', 'fechaInicio', 'fechaFin', 'cedulaCliente', 'nombreCliente', 'rutaInfo'].includes(key) && 
                  modalDetails[key] !== null && 
                  modalDetails[key] !== undefined &&
                  typeof modalDetails[key] !== 'object'
                ).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-800 mb-4">Información adicional</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.keys(modalDetails).filter(key => 
                        !['idReserva', 'estado', 'fechaInicio', 'fechaFin', 'cedulaCliente', 'nombreCliente', 'rutaInfo'].includes(key) && 
                        modalDetails[key] !== null && 
                        modalDetails[key] !== undefined &&
                        typeof modalDetails[key] !== 'object'
                      ).map(key => (
                        <div key={key} className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-500 text-xs mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                          <p className="font-medium text-gray-800">
                            {typeof modalDetails[key] === 'boolean' ? (modalDetails[key] ? 'Sí' : 'No') : modalDetails[key].toString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 p-4 flex justify-end">
                <button 
                  onClick={cerrarModal}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
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