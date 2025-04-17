import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { BotonPagoRuta } from "../PagoRuta";

export const NuestrasRutasInicio = () => {
  const { t } = useTranslation();
  const [rutas, setRutas] = useState([]);
  const [rutasConFotos, setRutasConFotos] = useState({});
  const [error, setError] = useState(null);
  const [cargandoFotos, setCargandoFotos] = useState({});
  const navigate = useNavigate();

  // Estados para los filtros

  // Estado para controlar la visibilidad del panel de filtros

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const response = await axios.get("http://localhost:10101/rutas");

        if (Array.isArray(response.data)) {
          setRutas(response.data);

          // Obtener fotos para cada ruta
          response.data.forEach((ruta) => {
            // Verificar que la ruta tenga un ID válido
            if (ruta && ruta.idRuta && !isNaN(ruta.idRuta)) {
              setCargandoFotos((prev) => ({ ...prev, [ruta.idRuta]: true }));
              obtenerFotosRuta(ruta.idRuta);
            }
          });
        } else {
          throw new Error("La respuesta no es un array");
        }
      } catch (error) {
        console.error("Error al obtener las rutas:", error);
        setError(error.message);
      }
    };

    fetchRutas();
  }, []);

  // Función para obtener las fotos de una ruta específica
  const obtenerFotosRuta = async (idRuta) => {
    try {
      // Verificar que el ID sea válido antes de hacer la petición
      if (!idRuta || isNaN(idRuta)) {
        console.warn("ID de ruta no válido:", idRuta);
        setCargandoFotos((prev) => ({ ...prev, [idRuta]: false }));
        return;
      }

      const response = await axios.get(
        `http://localhost:10101/rutas/fotos-publicas/${idRuta}`
      );

      if (
        response.data &&
        response.data.fotos &&
        Array.isArray(response.data.fotos)
      ) {
        let fotosArray = [];

        // Extraer las URLs de las fotos según la estructura exacta
        const primerElemento = response.data.fotos[0];

        if (Array.isArray(primerElemento)) {
          // Extraer las URLs de los objetos en el primer elemento
          primerElemento.map((item) => {
            if (
              item &&
              typeof item === "object" &&
              item.foto &&
              typeof item.foto === "string"
            ) {
              fotosArray.push(item.foto);
            }
          });
        }

        // Limitar a solo 4 fotos
        const fotosFiltradas = fotosArray.slice(0, 1);

        if (fotosFiltradas.length > 0) {
          setRutasConFotos((prevState) => ({
            ...prevState,
            [idRuta]: fotosFiltradas,
          }));
        }
      }
      setCargandoFotos((prev) => ({ ...prev, [idRuta]: false }));
    } catch (error) {
      console.error(`Error al obtener fotos para la ruta ${idRuta}:`, error);
      setCargandoFotos((prev) => ({ ...prev, [idRuta]: false }));
    }
  };

  // Función para determinar si estamos en la vista de cliente
  const esVistaCliente = () => {
    const currentPath = window.location.pathname;
    return currentPath.includes("/VistaCliente");
  };

  // Función para navegar a la página completa de rutas según el rol
  const navegarAPaginaCompleta = () => {
    if (esVistaCliente()) {
      navigate("/VistaCliente/NuestrasRutas");
    } else {
      navigate("/NuestrasRutas");
    }
  };

  const verDetallesRuta = (idRuta) => {
    // Asegurarse de que el ID sea un número si es posible
    const rutaId = !isNaN(parseInt(idRuta)) ? parseInt(idRuta) : idRuta;

    // Verificar si estamos en la vista de cliente
    const isClientView = esVistaCliente();

    

    if (isClientView) {
      // Si estamos en la vista de cliente, mantener el contexto de cliente
      navigate(`/VistaCliente/NuestrasRutas/${rutaId}`);
    } else {
      // Si no, usar la ruta normal
      navigate(`/NuestrasRutas/${rutaId}`);
    }
  };

  // Función para obtener las tres primeras rutas
  const obtenerTresPrimerasRutas = () => {
    return rutas.slice(0, 3);
  };

  return (
    <>
      <section className="relative py-2 px-4 overflow-hidden">
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
        <div className="container mx-auto px-4 py-8">
          <div className="relative py-8 mb-10">
            {/* Bolitas decorativas a los lados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Bolitas lado izquierdo */}
              <div className="absolute top-1/4 left-4 w-6 h-6 bg-teal-600 rounded-full opacity-20 animate-pulse"></div>
              <div
                className="absolute top-1/2 left-12 w-4 h-4 bg-teal-700 rounded-full opacity-30 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute bottom-1/4 left-8 w-5 h-5 bg-teal-500 rounded-full opacity-25 animate-pulse"
                style={{ animationDelay: "1.5s" }}
              ></div>

              {/* Bolitas lado derecho */}
              <div
                className="absolute top-1/3 right-10 w-5 h-5 bg-teal-600 rounded-full opacity-20 animate-pulse"
                style={{ animationDelay: "0.7s" }}
              ></div>
              <div
                className="absolute top-2/3 right-6 w-7 h-7 bg-teal-700 rounded-full opacity-15 animate-pulse"
                style={{ animationDelay: "1.2s" }}
              ></div>
              <div
                className="absolute bottom-1/3 right-16 w-4 h-4 bg-teal-500 rounded-full opacity-25 animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>

            {/* Líneas decorativas */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-600 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-600 to-transparent"></div>

            {/* Título principal con efectos */}
            <div className="relative z-10 text-center">
              <h1 className="text-5xl font-black tracking-tight relative inline-block">
                <span className="relative bg-clip-text text-transparent bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 drop-shadow-sm">
                  {t("tituloRutas", "Nuestras Rutas")}
                </span>
              </h1>

              {/* Subtítulo o decoración */}
              <div className="mt-2 text-xs font-medium uppercase tracking-widest text-teal-600 opacity-80">
                <span className="inline-block mx-2">✦</span>
                <span>{t("exploraYDescubre", "Explora y Descubre")}</span>
                <span className="inline-block mx-2">✦</span>
              </div>

              {/* Líneas decorativas bajo el título */}
              <div className="mt-3 flex justify-center space-x-1">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent to-teal-600 rounded-full"></div>
                <div className="w-24 h-1 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full"></div>
                <div className="w-12 h-1 bg-gradient-to-r from-teal-700 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Botón para mostrar/ocultar filtros */}

          {/* Filtro centrado y más pequeño */}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm max-w-4xl mx-auto">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {Array.isArray(rutas) && rutas.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center mx-auto max-w-6xl">
                {obtenerTresPrimerasRutas().map((ruta) => (
                  <div
                    key={`${ruta.idRuta}-${ruta.nombreRuta}`}
                    className="group bg-gradient-to-br from-white to-teal-50 rounded-lg shadow-md overflow-hidden transform transition-all duration-500 hover:shadow-[0_10px_20px_rgba(8,145,178,0.3)] hover:-translate-y-1 border border-teal-100 relative flex flex-col h-full w-full max-w-xs"
                  >
                    {/* Cinta decorativa en la esquina */}
                    <div className="absolute -right-8 -top-2 w-28 h-8 bg-teal-600 text-white text-xs font-bold px-0 py-1 shadow-md transform rotate-45 z-10 flex items-center justify-center">
                      <span className="text-white text-xs tracking-wider uppercase">
                        {ruta.tipo}
                      </span>
                    </div>

                    {/* Encabezado de la carta */}
                    <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-2 relative overflow-hidden h-16 flex flex-col justify-center">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-white opacity-5 rounded-full -mt-6 -mr-6"></div>
                      <div className="absolute bottom-0 left-0 w-10 h-10 bg-white opacity-5 rounded-full -mb-5 -ml-5"></div>

                      <h2 className="text-base font-bold mb-1 relative z-10 group-hover:text-teal-200 transition-colors duration-300 line-clamp-1">
                        {ruta.nombreRuta}
                      </h2>
                      <div className="flex items-center space-x-1 relative z-10">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-semibold transform transition-transform duration-300 group-hover:scale-105 ${
                            ruta.dificultad === "Facil"
                              ? "bg-gradient-to-r from-green-200 to-green-300 text-green-800"
                              : ruta.dificultad === "Moderada"
                              ? "bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800"
                              : "bg-gradient-to-r from-red-200 to-red-300 text-red-800"
                          }`}
                        >
                          {ruta.dificultad}
                        </span>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-semibold transform transition-transform duration-300 group-hover:scale-105 ${
                            ruta.estado === "Activa"
                              ? "bg-gradient-to-r from-green-200 to-green-300 text-green-800"
                              : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800"
                          }`}
                        >
                          {ruta.estado}
                        </span>
                      </div>
                    </div>

                    {/* Galería de imágenes */}
                    <div className="relative h-32 overflow-hidden">
                      {cargandoFotos[ruta.idRuta] ? (
                        <div className="flex justify-center items-center h-full bg-gray-100">
                          <div className="animate-pulse flex space-x-1">
                            <div className="h-1.5 w-1.5 bg-teal-600 rounded-full animate-bounce"></div>
                            <div
                              className="h-1.5 w-1.5 bg-teal-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="h-1.5 w-1.5 bg-teal-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      ) : rutasConFotos[ruta.idRuta] &&
                        rutasConFotos[ruta.idRuta].length > 0 ? (
                        <div className="h-full relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                          {rutasConFotos[ruta.idRuta].map((foto, index) => (
                            <img
                              key={index}
                              src={foto}
                              alt={`Foto de ${ruta.nombreRuta}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/300x200?text=Imagen+no+disponible";
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-center items-center h-full bg-gray-100">
                          <div className="text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 mx-auto text-teal-300 mb-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="text-xs text-gray-500 italic">
                              {t("sinFotos", "No hay fotos disponibles")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contenido de la carta */}
                    <div className="p-2 relative flex-grow flex flex-col">
                      {/* Elementos decorativos */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-teal-50 rounded-full -mt-10 -mr-10 opacity-30"></div>

                      {/* Información destacada */}
                      <div className="grid grid-cols-2 gap-1 mb-3 relative z-10">
                        <div className="flex flex-col items-center p-1.5 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-teal-700 mb-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-teal-800 text-xs font-medium ">
                            {t("duracion", "Duración")}
                          </span>
                          <span className="text-teal-900 text-xs font-bold">
                            {ruta.duracion}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-1.5 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-teal-700 mb-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                          <span className="text-teal-800 text-xs font-medium ">
                            {t("distancia", "Distancia")}
                          </span>
                          <span className="text-teal-900 text-xs font-bold">
                            {ruta.distancia} km
                          </span>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="mb-3 relative z-10 h-16">
                        <h3 className="text-teal-800 text-xs font-semibold mb-1 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {t("descripcion", "Descripción")}
                        </h3>
                        <div className="bg-white bg-opacity-70 p-1.5 rounded-lg shadow-inner h-full">
                          <p className="text-gray-700 text-xs line-clamp-2 italic">
                            {ruta.descripcion}
                          </p>
                        </div>
                      </div>

                      {/* Detalles adicionales en línea */}
                      <div className="flex flex-col space-y-2 mb-3 relative z-10">
                        <div className="flex items-center bg-white bg-opacity-70 p-1.5 rounded-lg transform transition-transform duration-300 group-hover:translate-x-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-teal-700 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="text-gray-700 text-xs">
                            <span className="font-medium">
                              {t("capacidadMaxima", "Cap")}:
                            </span>{" "}
                            {ruta.capacidadMaxima}
                          </span>
                        </div>
                        <div className="flex items-center bg-white bg-opacity-70 p-1.5 rounded-lg transform transition-transform duration-300 group-hover:translate-x-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-teal-700 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span className="text-gray-700 text-xs">
                            <span className="font-medium">
                              {t("tipo", "Tipo")}:
                            </span>{" "}
                            {ruta.tipo}
                          </span>
                        </div>
                        
                        {/* Estrellas de calificación centradas */}
                        <div className="flex justify-center mt-2 mb-1 relative z-10">
                          <div className=" rounded-full px-2 py-1 flex items-center">
                            <div className="flex">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="relative z-10 mt-auto flex flex-col space-y-2">
                        {/* Botón para reservar */}
                        <BotonPagoRuta
                          ruta={ruta}
                          className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white py-2 px-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                        />

                        {/* Botón para ver detalles */}
                        <button
                          onClick={() => verDetallesRuta(ruta.idRuta)}
                          className="w-full bg-white border border-teal-200 hover:bg-teal-50 text-teal-700 py-2 px-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span className="text-xs font-medium tracking-wide">
                            {t("verDetalles", "Ver Detalles")}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón "Ver más" */}
              {rutas.length > 3 && (
                <div className="flex justify-center mt-8 mb-4">
                  <button
                    onClick={navegarAPaginaCompleta}
                    className="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white py-2 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <span className="relative z-10 text-sm font-medium tracking-wide flex items-center">
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
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      {t("verMasRutas", "Ver Todas las Rutas")}
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-center">
              {t("noRutasDisponibles", "No hay rutas disponibles")}
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default NuestrasRutasInicio;
