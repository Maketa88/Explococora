import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  FaSearch,
  FaMinus,
  FaPlus,
  FaAngleDown,
  FaAngleUp,
  
  FaTshirt,
  FaUtensils,
  
  
  FaGift,
  FaWineBottle,
  FaQuestion,
  FaUmbrella,
  FaHatCowboy,
  
  FaCampground,
  FaWater,
  FaFish,
  FaCoffee,
  FaHamburger,
  FaCookie,
  FaPizzaSlice,
  FaCheese,
  
  FaLeaf,
  
  FaHome,
  
  
  
  FaSocks,
  FaGlassMartini,
  FaGlassMartiniAlt,
  FaShoppingBasket,
  FaDrumstickBite,
  FaConciergeBell,
  FaRunning,
  FaPaintBrush,
  FaGlassCheers,
  FaEllipsisH,
} from "react-icons/fa";

// Mapeo de categorías a iconos con iconos mejorados
const CATEGORY_ICONS = {
  Indumentaria: (
    <div className="flex items-center justify-center bg-blue-100 rounded-full p-1.5">
      <FaTshirt className="text-blue-600 text-lg" />
    </div>
  ),
  Alimentación: (
    <div className="flex items-center justify-center bg-orange-100 rounded-full p-1.5">
      <FaDrumstickBite className="text-orange-600 text-lg" />
    </div>
  ),
  Alojamiento: (
    <div className="flex items-center justify-center bg-purple-100 rounded-full p-1.5">
      <FaConciergeBell className="text-purple-600 text-lg" />
    </div>
  ),
  Actividades: (
    <div className="flex items-center justify-center bg-green-100 rounded-full p-1.5">
      <FaRunning className="text-green-600 text-lg" />
    </div>
  ),
  Artesanías: (
    <div className="flex items-center justify-center bg-red-100 rounded-full p-1.5">
      <FaPaintBrush className="text-red-600 text-lg" />
    </div>
  ),
  Bebidas: (
    <div className="flex items-center justify-center bg-teal-100 rounded-full p-1.5">
      <FaGlassCheers className="text-teal-600 text-lg" />
    </div>
  ),
  Otros: (
    <div className="flex items-center justify-center bg-gray-100 rounded-full p-1.5">
      <FaEllipsisH className="text-gray-600 text-lg" />
    </div>
  ),
  Todos: (
    <div className="flex items-center justify-center bg-teal-100 rounded-full p-1.5">
      <FaShoppingBasket className="text-teal-600 text-lg" />
    </div>
  ),
};

// Mapeo simplificado para servicios
const SERVICE_ICONS = {
  // Indumentaria
  "Poncho tradicional": <FaTshirt className="text-red-600 text-xl" />,
  "Poncho impermeable": <FaUmbrella className="text-blue-500 text-xl" />,
  Sombrero: <FaHatCowboy className="text-yellow-800 text-xl" />,
  Botas: <FaSocks className="text-amber-800 text-xl" />,
  "Carpa para camping": <FaCampground className="text-green-600 text-xl" />,

  // Alimentación
  Almuerzo: <FaHamburger className="text-orange-600 text-xl" />,
  Galletas: <FaCookie className="text-yellow-600 text-xl" />,
  "Barra energética": <FaLeaf className="text-green-500 text-xl" />,
  "Arequipe con oblea": <FaCheese className="text-amber-600 text-xl" />,
  Empanada: <FaPizzaSlice className="text-yellow-700 text-xl" />,
  Tamales: <FaUtensils className="text-orange-600 text-xl" />,
  "Chorizo santarrosano": <FaHamburger className="text-red-600 text-xl" />,

  // Alojamiento
  Camping: <FaCampground className="text-orange-600 text-xl" />,
  Hospedaje: <FaHome className="text-amber-800 text-xl" />,

  // Actividades
  "Paseo a la truchera": <FaFish className="text-blue-500 text-xl" />,
  "Pescar en la truchera": <FaFish className="text-blue-600 text-xl" />,

  // Artesanías
  "Manilla artesanal": <FaGift className="text-amber-500 text-xl" />,
  "Llavero artesanal": <FaGift className="text-yellow-600 text-xl" />,
  "Collar artesanal": <FaGift className="text-purple-500 text-xl" />,

  // Bebidas
  "Botella de agua": <FaWater className="text-blue-500 text-xl" />,
  "Jugo de naranja": <FaGlassMartini className="text-orange-500 text-xl" />,
  "Jugo de lulo": <FaGlassMartiniAlt className="text-green-500 text-xl" />,
  "Aguapanela con queso": <FaCheese className="text-amber-500 text-xl" />,
  "Chocolate caliente": <FaCoffee className="text-amber-700 text-xl" />,
  "Café campesino": <FaCoffee className="text-amber-800 text-xl" />,
  Gaseosa: <FaWineBottle className="text-red-500 text-xl" />,

  // Otros
  "Bloqueador solar": (
    <div className="h-7 w-7 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-yellow-500"
      >
        <path d="M8 7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7V10H8V7Z" />
        <path
          fillRule="evenodd"
          d="M7 9C5.89543 9 5 9.89543 5 11V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V11C19 9.89543 18.1046 9 17 9H7ZM9.5 12C9.22386 12 9 12.2239 9 12.5V13.5C9 13.7761 9.22386 14 9.5 14H14.5C14.7761 14 15 13.7761 15 13.5V12.5C15 12.2239 14.7761 12 14.5 12H9.5Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  ),
  Repelente: (
    <div className="h-7 w-7 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-red-600"
      >
        {/* Cuerpo del mosquito */}
        <path
          d="M12,18 C9,18 6.5,16 6.5,13.5 C6.5,11 8,10 8,8 C8,6 10,4 12,4 C14,4 16,6 16,8 C16,10 17.5,11 17.5,13.5 C17.5,16 15,18 12,18Z"
          strokeLinecap="round"
          fill="rgba(183, 28, 28, 0.2)"
        />

        {/* Alas */}
        <path d="M9,9 C7,7 4,8 3,11" strokeLinecap="round" />
        <path d="M15,9 C17,7 20,8 21,11" strokeLinecap="round" />

        {/* Patas */}
        <path d="M8,14 C7,15 5,18 3,19" strokeLinecap="round" />
        <path d="M10,15 C9,16 8,19 7,20" strokeLinecap="round" />
        <path d="M14,15 C15,16 16,19 17,20" strokeLinecap="round" />
        <path d="M16,14 C17,15 19,18 21,19" strokeLinecap="round" />

        {/* Aguijón/probóscide */}
        <path d="M12,4 L12,2" strokeLinecap="round" />
      </svg>
    </div>
  ),
  "Protector solar": (
    <div className="h-7 w-7 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-orange-400"
      >
        <path d="M8 7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7V10H8V7Z" />
        <path
          fillRule="evenodd"
          d="M7 9C5.89543 9 5 9.89543 5 11V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V11C19 9.89543 18.1046 9 17 9H7ZM9.5 12C9.22386 12 9 12.2239 9 12.5V13.5C9 13.7761 9.22386 14 9.5 14H14.5C14.7761 14 15 13.7761 15 13.5V12.5C15 12.2239 14.7761 12 14.5 12H9.5Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  ),
  "Repelente contra insectos": (
    <div className="h-7 w-7 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-red-600"
      >
        {/* Cuerpo del mosquito */}
        <path
          d="M12,18 C9,18 6.5,16 6.5,13.5 C6.5,11 8,10 8,8 C8,6 10,4 12,4 C14,4 16,6 16,8 C16,10 17.5,11 17.5,13.5 C17.5,16 15,18 12,18Z"
          strokeLinecap="round"
          fill="rgba(183, 28, 28, 0.2)"
        />

        {/* Alas */}
        <path d="M9,9 C7,7 4,8 3,11" strokeLinecap="round" />
        <path d="M15,9 C17,7 20,8 21,11" strokeLinecap="round" />

        {/* Patas */}
        <path d="M8,14 C7,15 5,18 3,19" strokeLinecap="round" />
        <path d="M10,15 C9,16 8,19 7,20" strokeLinecap="round" />
        <path d="M14,15 C15,16 16,19 17,20" strokeLinecap="round" />
        <path d="M16,14 C17,15 19,18 21,19" strokeLinecap="round" />

        {/* Aguijón/probóscide */}
        <path d="M12,4 L12,2" strokeLinecap="round" />

        {/* Símbolo de prohibido (para indicar repelente) */}
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="red"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />
        <line x1="5" y1="19" x2="19" y2="5" stroke="red" strokeWidth="1.5" />
      </svg>
    </div>
  ),
};

// Función para obtener icono por servicio
const getIconForService = (servicio) => {
  // Primero buscar por nombre exacto
  if (SERVICE_ICONS[servicio.nombre]) {
    return SERVICE_ICONS[servicio.nombre];
  }

  // Buscar por palabras clave en el nombre
  const nombreLower = servicio.nombre.toLowerCase();

  if (
    nombreLower.includes("bloqueador") ||
    nombreLower.includes("protector solar")
  )
    return SERVICE_ICONS["Bloqueador solar"];

  if (nombreLower.includes("repelente") || nombreLower.includes("insecto"))
    return SERVICE_ICONS["Repelente"];

  if (nombreLower.includes("poncho") || nombreLower.includes("ropa"))
    return <FaTshirt className="text-indigo-500 text-xl" />;
  if (nombreLower.includes("agua") || nombreLower.includes("botella"))
    return <FaWater className="text-blue-500 text-xl" />;
  if (nombreLower.includes("jugo"))
    return <FaGlassMartini className="text-orange-500 text-xl" />;
  if (nombreLower.includes("gaseosa") || nombreLower.includes("refresco"))
    return <FaWineBottle className="text-red-500 text-xl" />;
  if (nombreLower.includes("comida") || nombreLower.includes("alimento"))
    return <FaUtensils className="text-orange-500 text-xl" />;
  if (nombreLower.includes("artesanal") || nombreLower.includes("artesanía"))
    return <FaGift className="text-red-500 text-xl" />;

  // Si no encuentra nada específico, usar icono de categoría
  return (
    CATEGORY_ICONS[servicio.categoria] || (
      <FaQuestion className="text-gray-600 text-xl" />
    )
  );
};

export const ServiciosAdicionalesPaquete = ({
  onServiciosChange,
  cantidadPersonas = 1,
}) => {
  const { t } = useTranslation();
  const [categorias, setCategorias] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState({});
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Estado para controlar si el usuario quiere ver servicios adicionales
  const [mostrarServicios, setMostrarServicios] = useState(false);

  // Nuevo estado para categorías expandidas
  const [categoriasExpandidas, setCategoriasExpandidas] = useState({});

  // Obtener categorías y servicios solo cuando el usuario decide ver servicios
  useEffect(() => {
    const obtenerDatos = async () => {
      if (!mostrarServicios) return;

      try {
        setCargando(true);

        // Obtener categorías
        const resCategorias = await axios.get(
          "http://localhost:10101/servicios-adicionales/categorias"
        );

        if (resCategorias.data.success) {
          const categoriasData = resCategorias.data.categorias;
          setCategorias(["Todos", ...categoriasData]);

          // Inicializar categorías expandidas
          const expandidas = {};
          categoriasData.forEach((cat) => {
            expandidas[cat] = false; // Todas las categorías colapsadas inicialmente
          });
          setCategoriasExpandidas(expandidas);
        }

        // Obtener todos los servicios
        const resServicios = await axios.get(
          "http://localhost:10101/servicios-adicionales"
        );

        if (resServicios.data.success) {
          setServicios(resServicios.data.servicios);
        }
      } catch (error) {
        console.error("Error al cargar servicios adicionales:", error);
        setError(
          t(
            "errorCargandoServicios",
            "No se pudieron cargar los servicios adicionales"
          )
        );
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, [t, mostrarServicios]);

  // Actualizar los servicios seleccionados para el componente padre
  useEffect(() => {
    if (onServiciosChange) {
      // Crear el array en el formato esperado para los siguientes componentes
      const serviciosArray = Object.entries(serviciosSeleccionados)
        .map(([idServicio, cantidad]) => {
          const servicio = servicios.find(
            (s) => s.idServicio === parseInt(idServicio)
          );
          if (!servicio || cantidad <= 0) return null;

          return {
            servicio: servicio,
            cantidad: cantidad,
          };
        })
        .filter(Boolean); // Eliminar valores nulos

      onServiciosChange(serviciosArray);
    }
  }, [serviciosSeleccionados, servicios, onServiciosChange]);

  // Filtrar servicios por categoría y búsqueda
  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((servicio) => {
      // Aplicar búsqueda global si hay término de búsqueda
      if (busqueda) {
        const terminoBusqueda = busqueda.toLowerCase();
        return (
          servicio.nombre.toLowerCase().includes(terminoBusqueda) ||
          servicio.descripcion.toLowerCase().includes(terminoBusqueda)
        );
      }

      // Si no hay búsqueda, aplicar filtro por categoría
      return (
        categoriaActiva === "Todos" || servicio.categoria === categoriaActiva
      );
    });
  }, [servicios, categoriaActiva, busqueda]);

  // Agrupar servicios por categoría
  const serviciosPorCategoria = useMemo(() => {
    if (categoriaActiva !== "Todos") {
      return { [categoriaActiva]: serviciosFiltrados };
    }

    return serviciosFiltrados.reduce((agrupados, servicio) => {
      if (!agrupados[servicio.categoria]) {
        agrupados[servicio.categoria] = [];
      }
      agrupados[servicio.categoria].push(servicio);
      return agrupados;
    }, {});
  }, [serviciosFiltrados, categoriaActiva]);

  // Manejar cambios en la selección de servicios
  const cambiarCantidad = (idServicio, cantidad) => {
    const nuevaCantidad = Math.max(0, cantidad);

    setServiciosSeleccionados((prev) => {
      const nuevosServicios = {
        ...prev,
        [idServicio]: nuevaCantidad,
      };

      // Si la cantidad es 0, eliminar el servicio de la selección
      if (nuevaCantidad === 0) {
        delete nuevosServicios[idServicio];
      }

      return nuevosServicios;
    });
  };

  // Toggle para expandir/colapsar categoría
  const toggleCategoria = (categoria) => {
    setCategoriasExpandidas((prev) => ({
      ...prev,
      [categoria]: !prev[categoria],
    }));
  };

  // Calcular el total de servicios seleccionados
  const calcularTotal = () => {
    return Object.entries(serviciosSeleccionados).reduce(
      (total, [idServicio, cantidad]) => {
        const servicio = servicios.find(
          (s) => s.idServicio === parseInt(idServicio)
        );
        return total + (servicio?.precio || 0) * cantidad;
      },
      0
    );
  };

  // Si no se ha decidido ver servicios, mostrar el toggle
  if (!mostrarServicios) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-teal-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-teal-700 mb-1">
                {t("serviciosAdicionales", "Servicios adicionales")}
              </h2>
              <p className="text-gray-600 text-sm">
                {t(
                  "descripcionServiciosAdicionales",
                  "¿Desea agregar servicios adicionales a su experiencia?"
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMostrarServicios(true)}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-all duration-200 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t("verServicios", "Ver servicios disponibles")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-red-200">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-teal-700 mb-2">
              {t("serviciosAdicionales", "Servicios adicionales")}{" "}
              <span className="text-sm font-normal text-gray-500">
                ({t("opcionales", "Opcionales")})
              </span>
            </h2>
            <p className="text-gray-600 text-sm">
              {t(
                "descripcionServiciosAdicionales",
                "Mejora tu experiencia con estos servicios adicionales."
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMostrarServicios(false)}
            className="text-teal-600 hover:text-teal-800 text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            {t("ocultarServicios", "No quiero servicios adicionales")}
          </button>
        </div>
      </div>

      {/* Buscador y filtros mejorados - REORGANIZADOS */}
      <div className="p-5 bg-teal-50 rounded-lg mb-4">
        {/* Buscador arriba */}
        <div className="relative mb-5 max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-teal-500" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={t(
              "ejemplosServicios",
              "Repelente, camping, poncho, almuerzo..."
            )}
            className="pl-10 w-full h-12 border-2 border-teal-300 rounded-lg py-2 px-4 
                      focus:ring-2 focus:ring-teal-500 focus:border-teal-500 
                      shadow-sm hover:shadow-md transition-all duration-300
                      bg-white text-gray-700 placeholder-teal-400"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg
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
                ></path>
              </svg>
            </button>
          )}
        </div>

        {/* Filtros centrados abajo - sin slider */}
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {categorias.map((categoria, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCategoriaActiva(categoria)}
              className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                categoriaActiva === categoria
                  ? "bg-teal-600 text-white font-medium shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              <span className="mr-2">
                {CATEGORY_ICONS[categoria] || (
                  <FaQuestion className="text-gray-400" />
                )}
              </span>
              <span className="font-medium">{categoria}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje de búsqueda cuando hay resultados de otras categorías */}
      {busqueda &&
        categoriaActiva !== "Todos" &&
        serviciosFiltrados.some((s) => s.categoria !== categoriaActiva) && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-3 mb-4 rounded-r-lg">
            <div className="flex items-center">
              <FaSearch className="h-5 w-5 mr-2" />
              <span>
                {t(
                  "resultadosBusquedaTodasCategorias",
                  "Mostrando resultados de todas las categorías para"
                )}
                :<span className="font-semibold mx-1">{busqueda}</span>
              </span>
            </div>
          </div>
        )}

      {/* Lista de servicios */}
      <div className="p-4">
        {cargando ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 mb-2"></div>
            <p className="text-teal-600">
              {t("cargandoServicios", "Cargando servicios adicionales...")}
            </p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            <p>{error}</p>
          </div>
        ) : Object.keys(serviciosPorCategoria).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(serviciosPorCategoria).map(
              ([categoria, serviciosCategoria]) => (
                <div
                  key={categoria}
                  className="bg-white rounded-lg overflow-hidden shadow border border-gray-100"
                >
                  <div className="bg-teal-600 text-white px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 text-teal-200">
                        {CATEGORY_ICONS[categoria] || (
                          <FaQuestion className="text-teal-600" />
                        )}
                      </div>
                      <h4 className="font-medium">
                        {t(categoria.toLowerCase(), categoria)}
                      </h4>
                    </div>

                    {/* Contador de elementos */}
                    {categoriaActiva === "Todos" && (
                      <span className="text-xs bg-teal-700 px-2 py-1 rounded-full">
                        {serviciosCategoria.length} {t("items", "elementos")}
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-gray-100">
                    {/* Cuando la categoría es "Todos", mostramos solo algunos servicios inicialmente */}
                    {(categoriaActiva === "Todos"
                      ? serviciosCategoria.slice(
                          0,
                          categoriasExpandidas[categoria] ? undefined : 2
                        )
                      : serviciosCategoria
                    ).map((servicio) => (
                      <div
                        key={servicio.idServicio}
                        className="p-4 hover:bg-teal-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex-1 flex items-start space-x-3">
                          {/* Icono de servicio */}
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full flex items-center justify-center">
                            {getIconForService(servicio)}
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-900">
                              {servicio.nombre}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {servicio.descripcion}
                            </p>
                            <p className="text-teal-600 font-medium mt-1">
                              ${Number(servicio.precio).toLocaleString("es-CO")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {serviciosSeleccionados[servicio.idServicio] ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  cambiarCantidad(
                                    servicio.idServicio,
                                    serviciosSeleccionados[
                                      servicio.idServicio
                                    ] - 1
                                  )
                                }
                                className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 
                                        hover:bg-teal-200 flex items-center justify-center"
                              >
                                <FaMinus className="h-3 w-3" />
                              </button>

                              <span className="w-8 text-center font-medium">
                                {serviciosSeleccionados[servicio.idServicio]}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  cambiarCantidad(
                                    servicio.idServicio,
                                    serviciosSeleccionados[
                                      servicio.idServicio
                                    ] + 1
                                  )
                                }
                                className="w-8 h-8 rounded-full bg-teal-600 text-white 
                                        hover:bg-teal-700 flex items-center justify-center"
                              >
                                <FaPlus className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                cambiarCantidad(servicio.idServicio, 1)
                              }
                              className="py-1 px-3 rounded-lg bg-teal-600 text-white text-sm 
                                      hover:bg-teal-700 transition-colors flex items-center"
                            >
                              <FaPlus className="h-3 w-3 mr-1" />
                              {t("agregar", "Agregar")}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Botón "Ver más" solo cuando es necesario */}
                    {categoriaActiva === "Todos" &&
                      serviciosCategoria.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCategoriasExpandidas((prev) => ({
                              ...prev,
                              [categoria]: !prev[categoria],
                            }));
                          }}
                          className="w-full py-2 text-teal-600 hover:text-teal-800 text-sm flex items-center justify-center"
                        >
                          {categoriasExpandidas[categoria] ? (
                            <>
                              <span>{t("verMenos", "Ver menos")}</span>
                              <FaAngleUp className="ml-1" />
                            </>
                          ) : (
                            <>
                              <span>
                                {t("verMas", "Ver")}{" "}
                                {serviciosCategoria.length - 2}{" "}
                                {t("mas", "más")}
                              </span>
                              <FaAngleDown className="ml-1" />
                            </>
                          )}
                        </button>
                      )}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            {t(
              "noHayServiciosDisponibles",
              "No hay servicios disponibles que coincidan con tu búsqueda."
            )}
          </div>
        )}
      </div>

      {/* Resumen de servicios seleccionados */}
      {Object.keys(serviciosSeleccionados).length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-teal-50">
          <h3 className="font-medium text-teal-800 mb-2">
            {t("resumenServicios", "Servicios seleccionados")}
          </h3>

          <div className="space-y-2 mb-3">
            {Object.entries(serviciosSeleccionados).map(
              ([idServicio, cantidad]) => {
                const servicio = servicios.find(
                  (s) => s.idServicio === parseInt(idServicio)
                );
                if (!servicio || cantidad <= 0) return null;

                return (
                  <div key={idServicio} className="flex justify-between">
                    <span>
                      {servicio.nombre} x {cantidad}
                    </span>
                    <span className="font-medium">
                      ${(servicio.precio * cantidad).toLocaleString("es-CO")}
                    </span>
                  </div>
                );
              }
            )}
          </div>

          <div className="border-t border-teal-200 pt-2 mt-2 flex justify-between font-bold text-teal-800">
            <span>{t("totalServicios", "Total servicios adicionales")}:</span>
            <span>${calcularTotal().toLocaleString("es-CO")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosAdicionalesPaquete;
