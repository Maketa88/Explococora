import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaHiking, FaShieldAlt, FaWater } from "react-icons/fa";
import {
  FiCamera,
  FiClock,
  FiCoffee,
  FiCompass,
  FiMap,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { GiMountainRoad } from "react-icons/gi";
import MapaRutaIntegracion from "../../../../../components/MapaRuta/components/MapaRutaIntegracion";
import { BotonPagoRuta } from "../../../../../components/PagoRuta";
import {
  obtenerFotosRuta,
  obtenerRutas,
} from "../../../../../services/rutasService";

// Imágenes de respaldo por dificultad (se usarán si no hay fotos disponibles de la API)
const imagenesRespaldoPorDificultad = {
  Facil:
    "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1470&auto=format&fit=crop",
  Moderada:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1470&auto=format&fit=crop",
  Desafiante:
    "https://images.unsplash.com/photo-1507041957456-9c397ce39c97?q=80&w=1412&auto=format&fit=crop",
};

// Iconos para las características
const IconoReloj = () => <FiClock className="h-5 w-5" />;
const IconoDistancia = () => <FiMapPin className="h-5 w-5" />;
const IconoActividad = () => <FiUsers className="h-5 w-5" />;

// Iconos para puntos de interés según el índice
const iconosPuntosInteres = [
  <FiCompass key="compass" className="w-5 h-5" />, // Mirador/Vista
  <FiCoffee key="coffee" className="w-5 h-5" />, // Zona de descanso
  <FiMap key="map" className="w-5 h-5" />, // Sendero
  <FiCamera key="camera" className="w-5 h-5" />, // Área fotográfica
];

// Componente para mostrar el color de dificultad
const EtiquetaDificultad = ({ dificultad }) => {
  const colorClases = {
    Facil: "bg-green-100 text-green-800 border-green-200",
    Moderada: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Desafiante: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colorClases[dificultad]} border`}
    >
      {dificultad}
    </span>
  );
};

// Componente para mostrar una característica con icono
const Caracteristica = ({ icono, texto, destacado = false }) => (
  <div className="flex items-center space-x-1">
    <span className="text-teal-600">{icono}</span>
    <span className={destacado ? "font-semibold" : ""}>{texto}</span>
  </div>
);

// Componente para mostrar un punto de interés en la ruta
const PuntoInteres = ({ nombre, descripcion, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 + index * 0.1 }}
    whileHover={{ scale: 1.02 }}
    className="flex items-center space-x-4 mb-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-teal-50"
  >
    <motion.div
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.5 }}
      className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-lg transform hover:shadow-xl"
    >
      {iconosPuntosInteres[index]}
    </motion.div>
    <div className="flex-grow">
      <motion.h4
        className="font-semibold text-gray-800 text-lg mb-1.5 relative inline-block"
        whileHover={{ x: 5 }}
      >
        {nombre}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-400 to-transparent transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></div>
      </motion.h4>
      <p className="text-gray-600 leading-relaxed">{descripcion}</p>
    </div>
  </motion.div>
);

// Puntos de interés por tipo de ruta
const puntosDeInteresPorTipo = {
  Facil: [
    {
      nombre: "Mirador Panorámico",
      descripcion:
        "Disfruta de vistas de 360° del valle y las montañas circundantes.",
    },
    {
      nombre: "Zona de Picnic",
      descripcion: "Área perfecta para descansar y disfrutar de un refrigerio.",
    },
    {
      nombre: "Sendero Interpretativo",
      descripcion: "Camino con señalización sobre la flora y fauna local.",
    },
    {
      nombre: "Área Fotográfica",
      descripcion:
        "Punto ideal para capturar recuerdos con un fondo espectacular.",
    },
  ],
  Moderada: [
    {
      nombre: "Bosque Nativo",
      descripcion:
        "Camina entre árboles centenarios y descubre la flora local.",
    },
    {
      nombre: "Cascada Natural",
      descripcion: "Un refrescante punto para descansar y tomar fotografías.",
    },
    {
      nombre: "Mirador Elevado",
      descripcion: "Plataforma con vistas panorámicas de todo el valle.",
    },
    {
      nombre: "Zona de Avistamiento",
      descripcion:
        "Área ideal para observar aves y posiblemente otros animales silvestres.",
    },
  ],
  Desafiante: [
    {
      nombre: "Cumbre Rocosa",
      descripcion:
        "Punto más alto con vistas impresionantes en todas direcciones.",
    },
    {
      nombre: "Paso Estrecho",
      descripcion:
        "Sección emocionante que requiere atención y buen equilibrio.",
    },
    {
      nombre: "Mirador del Cóndor",
      descripcion: "Lugar privilegiado para avistar estas majestuosas aves.",
    },
    {
      nombre: "Formaciones Geológicas",
      descripcion:
        "Estructuras rocosas únicas formadas a lo largo de millones de años.",
    },
  ],
};

export const ResultadoRuta = ({ resultadoIA, consulta }) => {
  // Estado para las rutas
  const [rutaPrincipal, setRutaPrincipal] = useState(null);
  const [rutasComplementarias, setRutasComplementarias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [rutasConFotos, setRutasConFotos] = useState({});
  const [rutasData, setRutasData] = useState([]);
  // Usamos cargandoFotos para seguimiento interno, aunque no se use en la renderización
  const [cargandoFotos, setCargandoFotos] = useState({});
  const { t } = useTranslation();

  // Función para obtener las fotos de una ruta específica
  const obtenerFotosParaRuta = async (idRuta) => {
    try {
      setCargandoFotos((prev) => ({ ...prev, [idRuta]: true }));
      const fotos = await obtenerFotosRuta(idRuta);

      if (fotos.length > 0) {
        setRutasConFotos((prevState) => ({
          ...prevState,
          [idRuta]: fotos,
        }));
      }
    } catch (error) {
      console.error(`Error al obtener fotos para la ruta ${idRuta}:`, error);
    } finally {
      setCargandoFotos((prev) => ({ ...prev, [idRuta]: false }));
    }
  };

  // Efecto para cargar las rutas desde la API
  useEffect(() => {
    const cargarRutas = async () => {
      try {
        const rutasResponse = await obtenerRutas();
        // Asignar IDs a las rutas si no los tienen
        const rutasConIds = rutasResponse.map((ruta, index) => ({
          ...ruta,
          idRuta: ruta.idRuta || index + 1,
        }));
        setRutasData(rutasConIds);
      } catch (error) {
        console.error("Error al cargar las rutas:", error);
        // Podrías mostrar un mensaje de error al usuario aquí
      }
    };

    cargarRutas();
  }, []);

  useEffect(() => {
    if (rutasData.length === 0) return;

    // Filtrar rutas según los resultados de la IA
    if (resultadoIA && resultadoIA.filtros) {
      const filtros = resultadoIA.filtros;
      let rutasFiltradas = [...rutasData];

      // Aplicar filtros de dificultad
      if (filtros.dificultad) {
        rutasFiltradas = rutasFiltradas.filter(
          (ruta) => ruta.dificultad === filtros.dificultad
        );
      }

      // Aplicar filtros de duración máxima
      if (filtros.duracion_maxima) {
        // Convertir duración a un formato comparable
        const convertirAMinutos = (duracion) => {
          if (duracion.includes("Min")) return parseInt(duracion);
          if (duracion.includes("Hora")) return parseInt(duracion) * 60;
          return 9999;
        };

        const minutosMax = convertirAMinutos(filtros.duracion_maxima);
        rutasFiltradas = rutasFiltradas.filter((ruta) => {
          const minutosRuta = convertirAMinutos(ruta.duracion);
          return minutosRuta <= minutosMax;
        });
      }

      // Aplicar filtros de duración exacta
      if (filtros.duracion) {
        rutasFiltradas = rutasFiltradas.filter(
          (ruta) => ruta.duracion === filtros.duracion
        );
      }

      // Aplicar filtros de distancia máxima
      if (filtros.distancia_maxima) {
        rutasFiltradas = rutasFiltradas.filter(
          (ruta) => parseFloat(ruta.distancia) <= filtros.distancia_maxima
        );
      }

      // Aplicar filtros de tipo de actividad
      if (filtros.tipo_actividad) {
        rutasFiltradas = rutasFiltradas.filter(
          (ruta) => ruta.tipo === filtros.tipo_actividad
        );
      }

      // Aplicar filtros de valoración mínima
      if (filtros.valoracion_minima) {
        rutasFiltradas = rutasFiltradas.filter(
          (ruta) => ruta.valoracion >= filtros.valoracion_minima
        );
      }

      // Aplicar filtros de nombre_contiene
      if (filtros.nombre_contiene) {
        const terminos = filtros.nombre_contiene.split(", ");
        rutasFiltradas = rutasFiltradas.filter((ruta) => {
          // Verificar si alguno de los términos está en el nombre o descripción
          return terminos.some(
            (termino) =>
              ruta.nombreRuta.toLowerCase().includes(termino.toLowerCase()) ||
              ruta.descripcion.toLowerCase().includes(termino.toLowerCase())
          );
        });
      }

      // Si no hay rutas que coincidan con los filtros, usar todas las rutas
      if (rutasFiltradas.length === 0) {
        rutasFiltradas = [...rutasData];
      }

      // Seleccionar una ruta principal aleatoria de las filtradas
      const rutaPrincipalIndex = Math.floor(
        Math.random() * rutasFiltradas.length
      );
      const rutaPrincipal = rutasFiltradas[rutaPrincipalIndex];

      // Seleccionar rutas complementarias (diferentes a la principal)
      const rutasRestantes = rutasData.filter(
        (ruta) => ruta.nombreRuta !== rutaPrincipal.nombreRuta
      );
      // Mezclar el array para obtener rutas aleatorias
      const rutasMezcladas = [...rutasRestantes].sort(
        () => Math.random() - 0.5
      );
      const rutasComplementarias = rutasMezcladas.slice(0, 3);

      setRutaPrincipal(rutaPrincipal);
      setRutasComplementarias(rutasComplementarias);

      // Obtener fotos para la ruta principal y las complementarias
      if (rutaPrincipal && rutaPrincipal.idRuta) {
        obtenerFotosParaRuta(rutaPrincipal.idRuta);
      }

      rutasComplementarias.forEach((ruta) => {
        if (ruta && ruta.idRuta) {
          obtenerFotosParaRuta(ruta.idRuta);
        }
      });

      setCargando(false);
    } else {
      // Si no hay resultados de IA, seleccionar rutas aleatorias
      const rutaPrincipalIndex = Math.floor(Math.random() * rutasData.length);
      const rutaPrincipal = rutasData[rutaPrincipalIndex];

      const rutasRestantes = rutasData.filter(
        (ruta) => ruta.nombreRuta !== rutaPrincipal.nombreRuta
      );
      const rutasMezcladas = [...rutasRestantes].sort(
        () => Math.random() - 0.5
      );
      const rutasComplementarias = rutasMezcladas.slice(0, 3);

      setRutaPrincipal(rutaPrincipal);
      setRutasComplementarias(rutasComplementarias);

      // Obtener fotos para la ruta principal y las complementarias
      if (rutaPrincipal && rutaPrincipal.idRuta) {
        obtenerFotosParaRuta(rutaPrincipal.idRuta);
      }

      rutasComplementarias.forEach((ruta) => {
        if (ruta && ruta.idRuta) {
          obtenerFotosParaRuta(ruta.idRuta);
        }
      });

      setCargando(false);
    }
  }, [resultadoIA, rutasData]);

  if (cargando) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Obtener puntos de interés según la dificultad de la ruta principal
  const puntosDeInteres = puntosDeInteresPorTipo[rutaPrincipal?.dificultad];

  // Función para obtener la imagen de una ruta
  const obtenerImagenRuta = (ruta) => {
    // Verificar si la ruta tiene un ID válido
    if (!ruta || !ruta.idRuta) {
      console.log("Ruta sin ID válido, usando imagen de respaldo");
      return imagenesRespaldoPorDificultad[ruta?.dificultad || "Moderada"];
    }

    // Si estamos cargando las fotos para esta ruta, mostrar un placeholder o la imagen de respaldo
    if (cargandoFotos[ruta.idRuta]) {
      return imagenesRespaldoPorDificultad[ruta.dificultad];
    }

    // Si tenemos fotos para esta ruta, mostrar la primera
    if (rutasConFotos[ruta.idRuta] && rutasConFotos[ruta.idRuta].length > 0) {
      const imagenUrl = rutasConFotos[ruta.idRuta][0];

      return imagenUrl;
    }

    // Si no hay fotos disponibles, mostrar la imagen de respaldo

    return imagenesRespaldoPorDificultad[ruta.dificultad];
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Encabezado con animación */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-teal-700 mb-2">
          {t("aventuraPersonalizada", "¡Tu Aventura Personalizada!")}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {consulta ? (
            <>
              {t("resultadoConsulta", "Resultados para tu búsqueda")}:{" "}
              <span className="font-semibold">{consulta}</span>
            </>
          ) : (
            t(
              "analisisIA",
              "Nuestra IA ha analizado tus preferencias y ha creado una experiencia única para ti."
            )
          )}
        </p>

        {/* Mostrar recomendaciones de la IA si existen */}
        {resultadoIA &&
          resultadoIA.recomendaciones &&
          resultadoIA.recomendaciones.length > 0 && (
            <div className="mt-4 bg-teal-50 p-4 rounded-lg border border-teal-100 inline-block">
              <h3 className="text-sm font-semibold text-teal-700 mb-2">
                {t("recomendacionesIA", "Recomendaciones personalizadas:")}
              </h3>
              <ul className="text-sm text-teal-600 text-left">
                {resultadoIA.recomendaciones.map((recomendacion, index) => (
                  <li key={index} className="mb-1 flex items-start">
                    <span className="text-teal-500 mr-2 mt-0.5">•</span>
                    {recomendacion}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </motion.div>

      {/* Ruta principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100"
      >
        <div className="relative">
          {/* Imagen de fondo */}
          <div className="h-64 md:h-80 overflow-hidden relative">
            {rutaPrincipal && cargandoFotos[rutaPrincipal.idRuta] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            )}
            <img
              src={rutaPrincipal ? obtenerImagenRuta(rutaPrincipal) : ""}
              alt={rutaPrincipal?.nombreRuta}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onError={(e) => {
                console.error(
                  "Error al cargar la imagen de la ruta principal:",
                  e
                );
                e.target.src =
                  imagenesRespaldoPorDificultad[
                    rutaPrincipal?.dificultad || "Moderada"
                  ];
              }}
            />
          </div>

          {/* Overlay con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <EtiquetaDificultad dificultad={rutaPrincipal.dificultad} />
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">
              {rutaPrincipal?.nombreRuta}
            </h2>
            <div className="flex flex-wrap gap-3 mt-2 text-white">
              <Caracteristica
                icono={<IconoReloj />}
                texto={rutaPrincipal?.duracion}
                destacado
              />
              <Caracteristica
                icono={<IconoDistancia />}
                texto={`${rutaPrincipal?.distancia} km`}
                destacado
              />
              <Caracteristica
                icono={<IconoActividad />}
                texto={rutaPrincipal?.tipo}
              />
            </div>
          </div>
        </div>

        {/* Contenido detallado */}
        <div className="">
          <div className="mb-6 p-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t("descripcion", "Descripción")}
            </h3>
            <p className="text-gray-700">{rutaPrincipal?.descripcion}</p>
          </div>

          {/* Botón de Reserva */}
          <div className="mb-8 px-4">
            <div className="text-center mb-3">
              <h3 className="text-xl font-semibold text-teal-700">
                {t("reservaAhora", "¿Te gusta esta ruta?")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "puedesReservarla",
                  "Puedes reservarla ahora mismo con un solo clic"
                )}
              </p>
            </div>
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="w-full max-w-sm"
              >
                <BotonPagoRuta
                  ruta={rutaPrincipal}
                  className="w-full py-3 px-6 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                />
              </motion.div>
            </div>
          </div>

          {/* Nuevo componente de Mapa de Mapbox*/}
          {rutaPrincipal && (
            <MapaRutaIntegracion rutaPrincipal={rutaPrincipal} altura="400px" />
          )}

          <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50 p-8 shadow-xl  relative overflow-hidden">
            <h3 className="text-2xl font-bold text-center mb-8 relative z-10">
              <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent px-4">
                {t("puntosInteres", "Lo que verás en esta ruta")}
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              {puntosDeInteres.map((punto, index) => (
                <PuntoInteres
                  key={index}
                  nombre={punto.nombre}
                  descripcion={punto.descripcion}
                  index={index}
                />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50 p-8 shadow-xl  relative overflow-hidden">
            <h3 className="text-2xl font-bold text-center mb-8 relative z-10">
              <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent px-4">
                {t("recomendaciones", "Recomendaciones")}
              </span>
            </h3>
            <div className="flex flex-col space-y-4 mt-6 relative z-10">
              <motion.div
                whileHover={{ x: 8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-r from-white to-teal-50 p-4 rounded-xl shadow-md border border-teal-100 flex items-center group hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-teal-600 to-teal-400 text-white rounded-xl p-3 mr-5 shadow-md flex-shrink-0 group-hover:shadow-lg transition-all duration-300 transform group-hover:-rotate-6">
                  <FaWater className="w-6 h-6" />
                </div>
                <p className="font-medium text-teal-700 group-hover:text-teal-800 transition-colors duration-300">
                  {t(
                    "recomendacionAgua",
                    "Lleva agua suficiente para mantenerte hidratado durante toda la ruta"
                  )}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ x: 8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-r from-white to-teal-50 p-4 rounded-xl shadow-md border border-teal-100 flex items-center group hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-teal-600 to-teal-400 text-white rounded-xl p-3 mr-5 shadow-md flex-shrink-0 group-hover:shadow-lg transition-all duration-300 transform group-hover:-rotate-6">
                  <FaHiking className="w-6 h-6" />
                </div>
                <p className="font-medium text-teal-700 group-hover:text-teal-800 transition-colors duration-300">
                  {t(
                    "recomendacionCalzadoCompleta",
                    "Usa calzado cómodo y adecuado para"
                  )}{" "}
                  {rutaPrincipal?.dificultad === "Facil"
                    ? t("terrenoPlano", "terreno plano")
                    : rutaPrincipal?.dificultad === "Moderada"
                    ? t("terrenoIrregular", "terreno irregular")
                    : t("terrenoEscarpado", "terreno escarpado")}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ x: 8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-r from-white to-teal-50 p-4 rounded-xl shadow-md border border-teal-100 flex items-center group hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-teal-600 to-teal-400 text-white rounded-xl p-3 mr-5 shadow-md flex-shrink-0 group-hover:shadow-lg transition-all duration-300 transform group-hover:-rotate-6">
                  <FaShieldAlt className="w-6 h-6" />
                </div>
                <p className="font-medium text-teal-700 group-hover:text-teal-800 transition-colors duration-300">
                  {t(
                    "recomendacionProteccionCompleta",
                    "Protección solar y repelente de insectos para una experiencia confortable"
                  )}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ x: 8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-r from-white to-teal-50 p-4 rounded-xl shadow-md border border-teal-100 flex items-center group hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-teal-600 to-teal-400 text-white rounded-xl p-3 mr-5 shadow-md flex-shrink-0 group-hover:shadow-lg transition-all duration-300 transform group-hover:-rotate-6">
                  <GiMountainRoad className="w-7 h-7" />
                </div>
                <p className="font-medium text-teal-700 group-hover:text-teal-800 transition-colors duration-300">
                  {rutaPrincipal?.dificultad === "Desafiante"
                    ? t(
                        "recomendacionDesafianteCompleta",
                        "Recomendable ir acompañado y con experiencia previa en rutas similares"
                      )
                    : t(
                        "recomendacionFacilCompleta",
                        "Ideal para disfrutar en familia o con amigos, perfecto para todas las edades"
                      )}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rutas complementarias */}
      <div>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-semibold text-gray-800 mb-4"
        >
          {t(
            "rutasComplementarias",
            "Rutas complementarias que podrían interesarte"
          )}
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rutasComplementarias.map((ruta, index) => (
            <motion.div
              key={ruta.nombreRuta}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col h-full"
            >
              <div className="h-40 overflow-hidden relative">
                {cargandoFotos[ruta.idRuta] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                  </div>
                )}
                <img
                  src={obtenerImagenRuta(ruta)}
                  alt={ruta.nombreRuta}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    console.error(
                      `Error al cargar la imagen de la ruta complementaria ${ruta.nombreRuta}:`,
                      e
                    );
                    e.target.src =
                      imagenesRespaldoPorDificultad[ruta.dificultad];
                  }}
                />
              </div>
              <div className="p-4 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {ruta.nombreRuta}
                  </h4>
                  <EtiquetaDificultad dificultad={ruta.dificultad} />
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                  <Caracteristica
                    icono={<IconoReloj />}
                    texto={ruta.duracion}
                  />
                  <Caracteristica
                    icono={<IconoDistancia />}
                    texto={`${ruta.distancia} km`}
                  />
                </div>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {ruta.descripcion}
                </p>
              </div>
              <div className="p-3 border-t border-gray-100">
                <p className="text-xs text-teal-600 text-center mb-2 font-medium">
                  {t(
                    "tambienTeGustara",
                    "¡También te encantará esta experiencia!"
                  )}
                </p>
                <BotonPagoRuta
                  ruta={ruta}
                  className="w-full py-2 text-sm bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
