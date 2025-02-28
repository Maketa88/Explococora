import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CardGuia } from "./Card";



// URL del backend (mejor moverla a un archivo de configuración)
const API_URL = "http://localhost:10101";

/**
 * Función para mapear los datos del guía desde el backend al formato esperado por el frontend
 * @param {Object} datosGuia - Datos del guía recibidos del backend
 * @returns {Object} - Datos del guía en el formato esperado por el frontend
 */
const mapearCamposGuia = (datosGuia) => {
  // Procesar el nombre completo si viene en un solo campo
  let primerNombre = "";
  let segundoNombre = "";
  let primerApellido = "";

  if (datosGuia.nombre_del_guia) {
    const partesNombre = datosGuia.nombre_del_guia.split(" ");

    // Asumimos que el formato es: [primer nombre] [segundo nombre] [apellidos]
    if (partesNombre.length >= 1) primerNombre = partesNombre[0];
    if (partesNombre.length >= 2) segundoNombre = partesNombre[1];
    if (partesNombre.length >= 3)
      primerApellido = partesNombre.slice(2).join(" ");
  }

  // Crear objeto con los campos mapeados
  return {
    id: datosGuia.id || "",
    cedula: datosGuia.cedula || "",
    primerNombre: datosGuia.primer_nombre || primerNombre,
    segundoNombre: datosGuia.segundo_nombre || segundoNombre,
    primerApellido: datosGuia.primer_apellido || primerApellido,
    email: datosGuia.email || "",
    foto: datosGuia.foto || "",
    // Normalizar el estado para que siempre sea en minúscula y coincida con los filtros
    estado: (datosGuia.estado || "").toLowerCase(),
    // Manejar correctamente el tipo
    tipo: datosGuia.tipo || "",
    nombreCompleto: datosGuia.nombre_del_guia || "",
  };
};

const NuestrosGuias = () => {
  const { t } = useTranslation();
  const [guias, setGuias] = useState([]);
  const [guiasFiltrados, setGuiasFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  // Nuevo estado para el filtro por estado (se gestiona aquí en lugar de en CardList)
  const [filtroEstado, setFiltroEstado] = useState("todos");
  // Nuevo estado para el filtro por tipo de guía
  const [filtroTipo, setFiltroTipo] = useState("todos");

  // Función para cargar los guías desde el backend
  const cargarGuias = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/guia/todos`);

      if (response.data && Array.isArray(response.data)) {
        // Procesar los datos recibidos
        const guiasValidados = response.data.map(mapearCamposGuia);
        setGuias(guiasValidados);
        setGuiasFiltrados(guiasValidados);
      } else {
        console.error("Formato de respuesta inesperado:", response.data);
        setError("Error en el formato de datos recibidos");
      }
    } catch (error) {
      console.error("Error al obtener los guías:", error);
      setError(
        error.response?.data?.message ||
          "Hubo un problema al conectar con el servidor. Por favor, inténtalo más tarde."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar guías al montar el componente
  useEffect(() => {
    cargarGuias();
  }, [cargarGuias]);

  // Aplicar todos los filtros cuando cambie cualquier criterio de filtrado
  useEffect(() => {
    // Comenzamos con todos los guías
    let resultado = [...guias];
    
    // Aplicar filtro de búsqueda textual
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase();
      resultado = resultado.filter(
        (guia) =>
          (guia.primerNombre &&
            guia.primerNombre.toLowerCase().includes(terminoBusqueda)) ||
          (guia.segundoNombre &&
            guia.segundoNombre.toLowerCase().includes(terminoBusqueda)) ||
          (guia.primerApellido &&
            guia.primerApellido.toLowerCase().includes(terminoBusqueda)) ||
          (guia.nombreCompleto &&
            guia.nombreCompleto.toLowerCase().includes(terminoBusqueda)) ||
          (guia.cedula && guia.cedula.toLowerCase().includes(terminoBusqueda)) ||
          (guia.email && guia.email.toLowerCase().includes(terminoBusqueda))
      );
    }
    
    // Aplicar filtro de estado
    if (filtroEstado !== "todos") {
      resultado = resultado.filter(guia => {
        const estadoGuia = (guia.estado || "").toLowerCase();
        return estadoGuia === filtroEstado.toLowerCase();
      });
    }
    
    // Aplicar filtro de tipo
    if (filtroTipo !== "todos") {
      resultado = resultado.filter(guia => {
        const tipoGuia = (guia.tipo || "").toLowerCase();
        return tipoGuia === filtroTipo.toLowerCase();
      });
    }
    
    setGuiasFiltrados(resultado);
  }, [busqueda, filtroEstado, filtroTipo, guias]);

  // Extraer los tipos de guía únicos para construir los filtros
  const tiposDeGuia = [...new Set(guias.map(guia => guia.tipo).filter(Boolean))];

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  // Configuración de los botones de filtro por estado
  const botonesEstado = [
    { 
      id: 'todos', 
      texto: 'Todos los Guías', 
      descripcion: 'Ver todos los guías registrados',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    { 
      id: 'disponible', 
      texto: 'Disponibles', 
      descripcion: 'Guías listos para servicio',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    { 
      id: 'ocupado', 
      texto: 'Ocupados', 
      descripcion: 'Guías en servicio actualmente',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'inactivo', 
      texto: 'Inactivos', 
      descripcion: 'Guías temporalmente fuera de servicio',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )
    }
  ];

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* Fondo decorativo inspirado en el Valle del Cocora */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white"></div>

        {/* Siluetas de palmeras de cera */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg
            viewBox="0 0 1200 600"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M100,600 C100,400 150,300 200,100 C220,300 240,400 260,600"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />
            <path
              d="M400,600 C400,350 450,250 500,50 C520,250 540,350 560,600"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />
            <path
              d="M700,600 C700,400 750,300 800,100 C820,300 840,400 860,600"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />
            <path
              d="M1000,600 C1000,350 1050,250 1100,50 C1120,250 1140,350 1160,600"
              fill="none"
              stroke="#047857"
              strokeWidth="8"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-emerald-900 relative">
              {t("tituloGuias")}
              <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-emerald-500 rounded-full"></span>
            </h1>
          </div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8 mt-6">
            {t("descripcionGuias")}
          </p>

          {/* Barra de búsqueda mejorada */}
          <div className="max-w-md mx-auto transform transition-all duration-300 hover:scale-105">
            <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-lg bg-white overflow-hidden border border-emerald-200 shadow-md">
              <div className="grid place-items-center h-full w-14 text-emerald-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                className="peer h-full w-full outline-none text-md text-gray-700 pr-6 pl-2"
                type="text"
                id="search"
                placeholder="Buscar guías por nombre, cédula o email..."
                value={busqueda}
                onChange={handleBusquedaChange}
              />
              {busqueda && (
                <button
                  className="absolute right-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setBusqueda("")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros por estado - Movido desde CardList al componente principal */}
        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-4 mb-10 max-w-6xl mx-auto px-4">
          {botonesEstado.map((boton) => {
            const esSeleccionado = filtroEstado === boton.id;
            
            return (
              <button
                key={boton.id}
                type="button"
                className={`
                  relative flex-1 min-h-[100px] px-6 py-5 rounded-xl transition-all duration-300 ease-in-out
                  flex items-center justify-center gap-3 shadow-lg
                  ${esSeleccionado 
                    ? 'bg-teal-800 text-white transform scale-105 shadow-xl z-10' 
                    : 'bg-white text-teal-800 border-2 border-teal-800/20 hover:border-teal-800 hover:bg-teal-50'
                  }
                  group overflow-hidden
                `}
                onClick={() => setFiltroEstado(boton.id)}
              >
                {/* Efecto de fondo al seleccionar */}
                {esSeleccionado && (
                  <span className="absolute inset-0 overflow-hidden">
                    <span className="absolute -inset-[10px] bg-teal-700 rounded-full blur-xl opacity-50"></span>
                  </span>
                )}
                
                {/* Contenedor principal para mejor organización en responsive */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                  {/* Círculo decorativo para el icono */}
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full shrink-0
                    ${esSeleccionado 
                      ? 'bg-white text-teal-800' 
                      : 'bg-teal-100 text-teal-800 group-hover:bg-teal-200'
                    }
                    transition-all duration-300
                  `}>
                    {boton.icon}
                  </div>
                  
                  {/* Texto del botón */}
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    <span className={`font-bold text-lg ${esSeleccionado ? 'text-white drop-shadow-sm' : ''}`}>{boton.texto}</span>
                    <span className={`text-xs ${esSeleccionado ? 'text-white font-medium drop-shadow-sm brightness-150' : 'text-teal-600'}`}>
                      {boton.descripcion}
                    </span>
                  </div>
                </div>
                
                {/* Indicador de selección */}
                {esSeleccionado && (
                  <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-white rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filtro por tipo de guía - Si hay varios tipos en los datos */}
        {tiposDeGuia.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setFiltroTipo("todos")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
                ${filtroTipo === "todos" 
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50"}`}
            >
              Todos los tipos
            </button>
            
            {tiposDeGuia.map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
                  ${filtroTipo === tipo 
                    ? "bg-emerald-600 text-white shadow-md" 
                    : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50"}`}
              >
                {tipo}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 border-solid rounded-full"></div>
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full absolute top-0 left-0"></div>
            </div>
            <p className="ml-4 text-emerald-700 font-medium">
              Cargando guías...
            </p>
          </div>
        )}

        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md my-8 max-w-2xl mx-auto"
            role="alert"
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-4 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-bold">Error al cargar los guías</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={cargarGuias}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors duration-300 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reintentar
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {guiasFiltrados.length === 0 && (busqueda || filtroEstado !== "todos" || filtroTipo !== "todos") && (
              <div className="text-center py-12 px-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 max-w-lg mx-auto shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-amber-400 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-amber-800 mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-amber-700 mb-4">
                    No hay guías que coincidan con los filtros seleccionados.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {busqueda && (
                      <button
                        onClick={() => setBusqueda("")}
                        className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-md transition-colors duration-300"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                    {filtroEstado !== "todos" && (
                      <button
                        onClick={() => setFiltroEstado("todos")}
                        className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-md transition-colors duration-300"
                      >
                        Mostrar todos los estados
                      </button>
                    )}
                    {filtroTipo !== "todos" && (
                      <button
                        onClick={() => setFiltroTipo("todos")}
                        className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-md transition-colors duration-300"
                      >
                        Mostrar todos los tipos
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Aquí pasamos directamente los guías filtrados al CardList, sin la prop de filtro */}
            {guiasFiltrados.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                {guiasFiltrados.map((guia, index) => (
                  <CardGuia key={guia.id || guia.cedula || index} guia={guia} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export { NuestrosGuias };