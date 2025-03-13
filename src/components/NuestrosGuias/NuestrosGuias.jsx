import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CardGuia } from "./Card";
import Feedback from "../Feedback/Feedback";

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

  // Obtener el teléfono de cualquiera de los campos disponibles
  const telefono =
    datosGuia.telefono ||
    datosGuia.numeroCelular ||
    datosGuia.numero_celular ||
    datosGuia.celular ||
    "No disponible";

  // Crear objeto con los campos mapeados
  return {
    id: datosGuia.id || "",
    cedula: datosGuia.cedula || "",
    primerNombre: datosGuia.primer_nombre || primerNombre,
    segundoNombre: datosGuia.segundo_nombre || segundoNombre,
    primerApellido: datosGuia.primer_apellido || primerApellido,
    email: datosGuia.email || "",
    foto: datosGuia.foto || "",
    nombreCompleto: datosGuia.nombre_del_guia || "",
    telefono: telefono,
  };
};

const NuestrosGuias = () => {
  const { t } = useTranslation();
  const [guias, setGuias] = useState([]);
  const [guiasFiltrados, setGuiasFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Función para obtener datos adicionales de un guía usando su cédula
  const obtenerDatosCompletos = async (cedula) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_URL}/guia/perfil-completo/${cedula}`,
        { headers }
      );

      // Verificar si la respuesta contiene datos
      if (response.data) {
        const guiaData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        return {
          telefono: guiaData.telefono || "No disponible",
          descripcion: guiaData.descripcion || guiaData.biografia || guiaData.bio || guiaData.informacion || null,
          // Puedes agregar más campos si los necesitas
        };
      }
      return null;
    } catch (error) {
      console.error(
        `Error al obtener datos completos del guía ${cedula}:`,
        error
      );

      return null;
    }
  };

  // Función para cargar los guías desde el backend
  const cargarGuias = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/guia/todos`);

      if (response.data && Array.isArray(response.data)) {
        // Procesar los datos recibidos
        const guiasValidados = response.data.map(mapearCamposGuia);

        // Para cada guía, intentar obtener datos adicionales si tiene cédula
        const guiasConDatosCompletos = await Promise.all(
          guiasValidados.map(async (guia) => {
            if (guia.cedula) {
              const datosAdicionales = await obtenerDatosCompletos(guia.cedula);
              if (datosAdicionales) {
                // Si el teléfono no está disponible en los datos originales pero sí en los adicionales
                if (
                  guia.telefono === "No disponible" &&
                  datosAdicionales.telefono !== "No disponible"
                ) {
                  return { 
                    ...guia, 
                    telefono: datosAdicionales.telefono,
                    descripcion: datosAdicionales.descripcion || null
                  };
                }
                // Si solo necesitamos agregar la descripción
                return {
                  ...guia,
                  descripcion: datosAdicionales.descripcion || null
                };
              }
            }
            return guia;
          })
        );

        setGuias(guiasConDatosCompletos);
        setGuiasFiltrados(guiasConDatosCompletos);
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

  // Aplicar filtro de búsqueda cuando cambie
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
          (guia.email && guia.email.toLowerCase().includes(terminoBusqueda)) ||
          (guia.telefono &&
            guia.telefono.toLowerCase().includes(terminoBusqueda))
      );
    }

    setGuiasFiltrados(resultado);
  }, [busqueda, guias]);

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

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
              {/* Silueta de montaña con árboles */}
              <path
                d="M0,600 L300,200 L400,300 L500,150 L600,250 L800,100 L1000,300 L1200,200 L1200,600 Z"
                fill="#047857"
                opacity="0.3"
              />
              
              {/* Arroyo serpenteante */}
              <path
                d="M0,450 C100,430 150,470 250,440 C350,410 400,450 500,430 C600,410 650,450 750,430 C850,410 900,450 1000,430 C1100,410 1150,450 1200,430 L1200,500 C1100,520 1050,480 950,500 C850,520 800,480 700,500 C600,520 550,480 450,500 C350,520 300,480 200,500 C100,520 50,480 0,500 Z"
                fill="#047857"
                opacity="0.4"
              />
              
              {/* Silueta de árbol 1 - pino */}
              <path
                d="M200,600 L200,400 L150,400 L200,350 L170,350 L220,300 L190,300 L240,250 L210,250 L250,200 L230,200 L270,150 L250,150 L280,100 L310,150 L290,150 L330,200 L310,200 L350,250 L320,250 L370,300 L340,300 L390,350 L360,350 L410,400 L360,400 L360,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              {/* Silueta de árbol 2 - frondoso */}
              <path
                d="M600,600 L600,350 C600,350 550,300 570,250 C590,200 630,220 650,180 C670,140 700,160 720,130 C740,100 780,120 800,150 C820,180 850,160 870,200 C890,240 930,220 950,270 C970,320 920,350 920,350 L920,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              {/* Silueta de árbol 3 - roble */}
              <path
                d="M1000,600 L1000,400 C1000,400 950,380 960,340 C970,300 1000,320 1010,280 C1020,240 1050,260 1060,220 C1070,180 1100,200 1110,240 C1120,280 1150,260 1160,300 C1170,340 1200,320 1200,360 C1200,400 1150,400 1150,400 L1150,600 Z"
                fill="#047857"
                opacity="0.7"
              />
              
              {/* Flores en el campo - grupo 1 */}
              <g opacity="0.6">
                <circle cx="150" cy="500" r="15" fill="#047857" />
                <circle cx="170" cy="485" r="15" fill="#047857" />
                <circle cx="190" cy="500" r="15" fill="#047857" />
                <circle cx="170" cy="515" r="15" fill="#047857" />
                <circle cx="170" cy="500" r="10" fill="#047857" />
              </g>
              
              {/* Flores en el campo - grupo 2 */}
              <g opacity="0.6">
                <circle cx="450" cy="520" r="15" fill="#047857" />
                <circle cx="470" cy="505" r="15" fill="#047857" />
                <circle cx="490" cy="520" r="15" fill="#047857" />
                <circle cx="470" cy="535" r="15" fill="#047857" />
                <circle cx="470" cy="520" r="10" fill="#047857" />
              </g>
              
              {/* Flores en el campo - grupo 3 */}
              <g opacity="0.6">
                <circle cx="750" cy="500" r="15" fill="#047857" />
                <circle cx="770" cy="485" r="15" fill="#047857" />
                <circle cx="790" cy="500" r="15" fill="#047857" />
                <circle cx="770" cy="515" r="15" fill="#047857" />
                <circle cx="770" cy="500" r="10" fill="#047857" />
              </g>
              
              {/* Mariposas */}
              <g opacity="0.7">
                {/* Mariposa 1 */}
                <path
                  d="M300,200 C320,180 340,190 330,210 C340,230 320,240 300,220 C280,240 260,230 270,210 C260,190 280,180 300,200 Z"
                  fill="#047857"
                />
                {/* Mariposa 2 */}
                <path
                  d="M700,150 C720,130 740,140 730,160 C740,180 720,190 700,170 C680,190 660,180 670,160 C660,140 680,130 700,150 Z"
                  fill="#047857"
                />
                {/* Mariposa 3 */}
                <path
                  d="M900,250 C920,230 940,240 930,260 C940,280 920,290 900,270 C880,290 860,280 870,260 C860,240 880,230 900,250 Z"
                  fill="#047857"
                />
              </g>
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
              placeholder="Buscar guías por nombre, email o teléfono..."
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

      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-solid rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full absolute top-0 left-0"></div>
          </div>
          <p className="ml-4 text-emerald-700 font-medium">Cargando guías...</p>
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
          {guiasFiltrados.length === 0 && busqueda && (
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
                  No hay guías que coincidan con tu búsqueda.
                </p>
                <button
                  onClick={() => setBusqueda("")}
                  className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-md transition-colors duration-300"
                >
                  Limpiar búsqueda
                </button>
              </div>
            </div>
          )}

          {guiasFiltrados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4 h-full">
              {guiasFiltrados.map((guia, index) => (
                <div
                  key={guia.id || guia.cedula || index}
                  className="h-full w-full flex"
                >
                  <CardGuia guia={guia} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Feedback debajo de las cartas de guías */}
      <div className="mt-16">
        <Feedback />
      </div>
    </div>
    </section>
  );
};

export { NuestrosGuias };

