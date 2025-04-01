import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
// Comentar el import de navigate ya que no se está utilizando
// import { useNavigate } from "react-router-dom";
import { BotonPagoRuta } from "../PagoRuta";

export const NuestrasRutasTarjeta = ({ onRutaSeleccionada, rutaActualId }) => {
  const { t } = useTranslation();
  const [rutas, setRutas] = useState([]);
  const [rutasConFotos, setRutasConFotos] = useState({});
  const [error, setError] = useState(null);
  const [cargandoFotos, setCargandoFotos] = useState({});
  const [desplazamiento, setDesplazamiento] = useState(0);
  const sliderRef = useRef(null);
  // Comentar navigate ya que no se está utilizando
  // const navigate = useNavigate();

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

  // Función para manejar el clic en una ruta
  const handleRutaClick = (ruta) => {
    if (onRutaSeleccionada) {
      onRutaSeleccionada(ruta);
    }
  };

  // Función para desplazar el slider a la izquierda o derecha
  const desplazarSlider = (direccion) => {
    if (!sliderRef.current) return;
    
    const containerWidth = sliderRef.current.clientWidth;
    // Calcular el ancho real de una tarjeta incluyendo su padding y gap
    const tarjetaElement = sliderRef.current.querySelector('div[class*="flex-shrink-0"]');
    let tarjetaWidth = containerWidth / 5; // Valor por defecto
    
    if (tarjetaElement) {
      // Obtener el ancho real de la tarjeta incluyendo margin/padding
      const tarjetaRect = tarjetaElement.getBoundingClientRect();
      tarjetaWidth = tarjetaRect.width;
    }
    
    let nuevoDesplazamiento;
    if (direccion === 'derecha') {
      // Avanzar solo 1 tarjeta para un desplazamiento más suave
      nuevoDesplazamiento = desplazamiento + 1;
      // Asegurarse de no desplazarse más allá del límite
      // Permitir ver hasta la última tarjeta completamente
      if (nuevoDesplazamiento > rutas.length - 4) {
        nuevoDesplazamiento = rutas.length - 4;
      }
    } else {
      // Retroceder solo 1 tarjeta
      nuevoDesplazamiento = desplazamiento - 1;
      // Asegurarse de no desplazarse a un valor negativo
      if (nuevoDesplazamiento < 0) {
        nuevoDesplazamiento = 0;
      }
    }
    
    setDesplazamiento(nuevoDesplazamiento);
    
    // Desplazar suavemente al inicio de la tarjeta
    sliderRef.current.scrollTo({
      left: nuevoDesplazamiento * tarjetaWidth,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <section className="relative  overflow-hidden ">
        {/* Fondo decorativo inspirado en el Valle del Cocora */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          

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
        <div className="container mx-auto px-4 ">
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
              <h1 className="text-4xl font-black tracking-tight relative inline-block">
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
              <div className="relative max-w-7xl mx-auto px-10">
                {/* Botón de desplazamiento izquierdo - posicionado fuera del slider */}
                <button
                  onClick={() => desplazamiento > 0 && desplazarSlider('izquierda')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-teal-600/80 hover:bg-teal-700 text-white p-2 rounded-full shadow-md transition-all duration-300 -translate-x-1/2"
                  aria-label="Desplazar a la izquierda"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Botón de desplazamiento derecho - posicionado fuera del slider */}
                <button
                  onClick={() => desplazamiento < rutas.length - 4 && desplazarSlider('derecha')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-teal-600/80 hover:bg-teal-700 text-white p-2 rounded-full shadow-md transition-all duration-300 translate-x-1/2"
                  aria-label="Desplazar a la derecha"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Contenedor de slider con scroll oculto - ajustado para ver la última tarjeta completa */}
                <div 
                  ref={sliderRef}
                  className="flex overflow-x-auto gap-4 pb-6 pt-2 px-6 scrollbar-hide snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {rutas.map((ruta, index) => (
                    <div
                      key={`${ruta.idRuta || index}-${ruta.nombreRuta}`}
                      className="flex-shrink-0 flex-grow-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 px-1 snap-start"
                      onClick={() => handleRutaClick(ruta)}
                    >
                      <div
                        className={`group bg-gradient-to-br from-white to-teal-50 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:shadow-teal-200 border border-teal-100 relative flex flex-col h-full w-full cursor-pointer ${rutaActualId === ruta.idRuta ? 'ring-2 ring-teal-500 scale-[1.02] shadow-lg shadow-teal-200/50 z-10' : ''}`}
                      >
                        {/* Cinta decorativa en la esquina */}
                        <div className="absolute -right-6 -top-1 w-20 h-6 bg-teal-600 text-white text-[10px] font-bold px-0 py-0.5 shadow-md transform rotate-45 z-10 flex items-center justify-center">
                          <span className="text-white text-[10px] tracking-wider uppercase">
                            {ruta.tipo}
                          </span>
                        </div>

                        {/* Encabezado de la carta */}
                        <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-1.5 relative overflow-hidden h-12 flex flex-col justify-center">
                          <div className="absolute top-0 right-0 w-12 h-12 bg-white opacity-5 rounded-full -mt-6 -mr-6"></div>
                          <div className="absolute bottom-0 left-0 w-10 h-10 bg-white opacity-5 rounded-full -mb-5 -ml-5"></div>

                          <h2 className="text-sm font-bold mb-0.5 relative z-10 group-hover:text-teal-200 transition-colors duration-300 line-clamp-1">
                            {ruta.nombreRuta}
                          </h2>
                          <div className="flex items-center space-x-1 relative z-10">
                            <span
                              className={`inline-block px-1 py-0 rounded-full text-[9px] font-semibold ${
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
                              className={`inline-block px-1 py-0 rounded-full text-[9px] font-semibold ${
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
                        <div className="relative h-24 overflow-hidden">
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
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
                                  className="h-4 w-4 mx-auto text-teal-300 mb-0.5"
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
                                <p className="text-[9px] text-gray-500 italic">
                                  {t("sinFotos", "No hay fotos disponibles")}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Contenido de la carta */}
                        <div className="p-1.5 relative flex-grow flex flex-col">
                          {/* Elementos decorativos */}
                          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-50 rounded-full -mt-10 -mr-10 opacity-30"></div>

                          {/* Información destacada */}
                          <div className="grid grid-cols-2 gap-1 mb-1 relative z-10">
                            <div className="flex flex-col items-center p-1 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-2.5 w-2.5 text-teal-700 mb-0.5"
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
                              <span className="text-teal-800 text-[9px] font-medium uppercase tracking-wider">
                                {t("duracion", "Duración")}
                              </span>
                              <span className="text-teal-900 text-[9px] font-bold">
                                {ruta.duracion}
                              </span>
                            </div>
                            <div className="flex flex-col items-center p-1 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-2.5 w-2.5 text-teal-700 mb-0.5"
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
                              <span className="text-teal-800 text-[9px] font-medium uppercase tracking-wider">
                                {t("distancia", "Distancia")}
                              </span>
                              <span className="text-teal-900 text-[9px] font-bold">
                                {ruta.distancia} km
                              </span>
                            </div>
                          </div>

                          {/* Descripción - Reducida en altura */}
                          <div className="mb-1 relative z-10 h-10">
                            <h3 className="text-teal-800 text-[9px] font-semibold mb-0.5 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-2.5 w-2.5 mr-0.5"
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
                            <div className="bg-white bg-opacity-70 p-1 rounded-lg shadow-inner h-full">
                              <p className="text-gray-700 text-[9px] line-clamp-1 italic">
                                {ruta.descripcion}
                              </p>
                            </div>
                          </div>

                          {/* Detalles adicionales - Una sola línea con dos elementos juntos */}
                          <div className=" mb-1 relative z-10">
                            <div className="flex items-center bg-white bg-opacity-70 p-1 rounded-lg text-[9px]">
                              <span className="text-gray-700">
                                <span className="font-medium mr-1">
                                  {t("capacidadMaxima", "Cap")}:
                                </span>
                                {ruta.capacidadMaxima}
                              </span>
                            </div>
                            <div className="flex items-center bg-white bg-opacity-70 p-1 rounded-lg text-[9px]">
                              <span className="text-gray-700">
                                <span className="font-medium mr-1">
                                  {t("precio", "Precio")}:
                                </span>
                                {ruta.precio} COP
                              </span>
                            </div>
                          </div>

                          {/* Botones de acción - En línea */}
                          <div className="relative z-10 mt-auto flex space-x-1 justify-center">
                            {/* Botón para reservar */}
                            <BotonPagoRuta
                              ruta={ruta}
                              className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white py-1 rounded-lg transition-all duration-300 text-[10px] flex items-center justify-center p-2"
                            />

                            {/* Botón para ver detalles */}
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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

export default NuestrasRutasTarjeta;
