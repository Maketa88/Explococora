// ... existing code ...
import React, { useEffect, useState } from 'react';
import DashboardLayoutGuia from '../../../layouts/DashboardLayoutGuia';
import axios from 'axios';
import { Filter, RefreshCw, Eye, ChevronLeft, ChevronRight, Search, XCircle, X, Mountain } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VisualizarRutas = () => {
  const [rutas, setRutas] = useState([]);
  const [rutasFiltradas, setRutasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const [fotosCompletas, setFotosCompletas] = useState([]);
  
  // Nuevos estados para manejar las fotos de las rutas en la lista
  const [rutasConFotos, setRutasConFotos] = useState({});
  const [cargandoFotos, setCargandoFotos] = useState({});
  
  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    dificultad: '',
    duracion: '',
    estado: '',
    tipo: ''
  });

  // Añadir el estado para el término de búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  useEffect(() => {
    fetchRutas();
  }, []);

  // Función para cargar las rutas
  const fetchRutas = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://servicio-explococora.onrender.com/rutas');
      console.log("API Response:", response.data);

      if (Array.isArray(response.data)) {
        setRutas(response.data);
        setRutasFiltradas(response.data);
        
        // Obtener fotos para cada ruta
        response.data.forEach(ruta => {
          // Verificar que la ruta tenga un ID válido
          if (ruta && ruta.idRuta && !isNaN(ruta.idRuta)) {
            setCargandoFotos(prev => ({...prev, [ruta.idRuta]: true}));
            obtenerFotosRuta(ruta.idRuta);
          }
        });
      } else {
        throw new Error("La respuesta no es un array");
      }
    } catch (error) {
      console.error("Error al obtener las rutas:", error);
      setError(error.message);
      toast.error("Error al cargar las rutas", {
        position: "top-right",
        autoClose: 3000,
        containerId: "rutas-toast",
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  // Mejorar la función para obtener todas las fotos de una ruta
  const obtenerFotosRuta = async (idRuta) => {
    try {
      console.log(`Obteniendo todas las fotos disponibles para la ruta ${idRuta}...`);
      setCargandoFotos(prev => ({...prev, [idRuta]: true}));
      
      let fotosArray = [];
      let fotosCompletasArray = [];
      let intentoExitoso = false;
      
      // INTENTO 1: Endpoint fotos
      try {
        const response = await axios.get(`https://servicio-explococora.onrender.com/rutas/fotos-publicas/${idRuta}`);
        
        console.log('Respuesta de endpoint fotos:', response.data);
        
        if (response.data && response.data.fotos) {
          if (Array.isArray(response.data.fotos)) {
            // Si es un array de strings (solo URLs)
            if (typeof response.data.fotos[0] === 'string') {
              fotosArray = response.data.fotos;
              // No tenemos IDs en este caso, solo URLs
              fotosCompletasArray = response.data.fotos.map(url => ({ foto: url }));
              intentoExitoso = true;
            } 
            // Si es un array de objetos con propiedad foto
            else if (response.data.fotos[0] && response.data.fotos[0].foto) {
              fotosArray = response.data.fotos.map(item => item.foto);
              fotosCompletasArray = response.data.fotos;
              intentoExitoso = true;
            } 
            // Si es un array anidado
            else if (Array.isArray(response.data.fotos[0])) {
              response.data.fotos[0].forEach(item => {
                if (item && typeof item === 'object' && item.foto) {
                  fotosArray.push(item.foto);
                  fotosCompletasArray.push(item);
                } else if (typeof item === 'string') {
                  fotosArray.push(item);
                  fotosCompletasArray.push({ foto: item });
                }
              });
              intentoExitoso = fotosArray.length > 0;
            }
          }
        }
      } catch (error) {
        console.log('Error en primer intento (endpoint fotos-publicas):', error.message);
      }
      
      // INTENTO 2: Como último recurso, intenta obtener las fotos de la ruta específica
      if (fotosArray.length === 0) {
        try {
          console.log(`Intentando obtener directamente la ruta ${idRuta} con sus fotos...`);
          const rutaResponse = await axios.get(`https://servicio-explococora.onrender.com/rutas/${idRuta}`);
          
          if (rutaResponse.data && rutaResponse.data.fotos) {
            if (Array.isArray(rutaResponse.data.fotos)) {
              fotosArray = rutaResponse.data.fotos;
              fotosCompletasArray = rutaResponse.data.fotos.map(url => ({ foto: url }));
            }
          }
        } catch (error) {
          console.log('Error en tercer intento (obtener ruta completa):', error.message);
        }
      }
      
      console.log(`Se encontraron ${fotosArray.length} fotos para la ruta ${idRuta}`);
      
      // Actualizamos los estados con las fotos encontradas
      if (fotosArray.length > 0) {
        setRutasConFotos(prev => ({
          ...prev,
          [idRuta]: fotosArray
        }));
        
        setImagenesPreview(fotosArray);
        setFotosCompletas(fotosCompletasArray);
      } else {
        console.log(`No se encontraron fotos para la ruta ${idRuta}`);
        setRutasConFotos(prev => ({...prev, [idRuta]: []}));
        setImagenesPreview([]);
        setFotosCompletas([]);
      }
      
      setCargandoFotos(prev => ({...prev, [idRuta]: false}));
      return fotosArray.length > 0;
    } catch (error) {
      console.log(`Error general al obtener fotos para la ruta ${idRuta}:`, error.message);
      setCargandoFotos(prev => ({...prev, [idRuta]: false}));
      setRutasConFotos(prev => ({...prev, [idRuta]: []}));
      setImagenesPreview([]);
      setFotosCompletas([]);
      return false;
    }
  };

  // Obtener color según dificultad
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Facil':
        return 'bg-emerald-500';
      case 'Moderada':
        return 'bg-amber-500';
      case 'Desafiante':
        return 'bg-rose-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Obtener icono según tipo
  const getRouteTypeIcon = (type) => {
    switch(type) {
      case 'Cabalgata':
        return '🐴';
      case 'Caminata':
        return '🥾';
      case 'Cabalgata y Caminata':
        return '🐴🥾';
      default:
        return '🏞️';
    }
  };

  // Función para obtener todas las fotos de una ruta - versión mejorada
  const fetchRutaImages = async (rutaId) => {
    // Simplemente llamamos a obtenerFotosRuta para mantener consistencia
    await obtenerFotosRuta(rutaId);
  };

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    let resultado = [...rutas];
    
    if (filtros.dificultad) {
      resultado = resultado.filter(ruta => ruta.dificultad === filtros.dificultad);
    }
    
    if (filtros.estado) {
      resultado = resultado.filter(ruta => ruta.estado === filtros.estado);
    }
    
    if (filtros.tipo) {
      resultado = resultado.filter(ruta => ruta.tipo === filtros.tipo);
    }
    
    if (filtros.duracion) {
      switch(filtros.duracion) {
        case 'corta':
          resultado = resultado.filter(ruta => {
            const duracionHoras = parseInt(ruta.duracion);
            return duracionHoras <= 2;
          });
          break;
        case 'media':
          resultado = resultado.filter(ruta => {
            const duracionHoras = parseInt(ruta.duracion);
            return duracionHoras > 2 && duracionHoras <= 4;
          });
          break;
        case 'larga':
          resultado = resultado.filter(ruta => {
            const duracionHoras = parseInt(ruta.duracion);
            return duracionHoras > 4;
          });
          break;
        default:
          break;
      }
    }
    
    setRutasFiltradas(resultado);
    setMostrarFiltros(false);
  };

  // Función para limpiar los filtros
  const limpiarFiltros = () => {
    setFiltros({
      dificultad: '',
      duracion: '',
      estado: '',
      tipo: ''
    });
    setRutasFiltradas(rutas);
    setMostrarFiltros(false);
  };

  // Añadir esta función para cerrar la vista de detalles
  const closeDetailView = () => {
    setIsDetailView(false);
    setActiveRoute(null);
    setImagenesPreview([]);
    setFotosCompletas([]);
  };

  // Actualizar la función para abrir el detalle y asegurar que cargue todas las fotos
  const openDetailView = async (ruta) => {
    setActiveRoute(ruta);
    setIsDetailView(true);
    
    // Obtenemos el ID correcto de la ruta
    const rutaId = ruta.idRuta || ruta.id;
    
    // Limpiar previsualizaciones existentes
    setImagenesPreview([]);
    setFotosCompletas([]);
    
    // Intentamos obtener todas las fotos y mostramos mensaje según resultado
    const fotosCargadas = await obtenerFotosRuta(rutaId);
    
    if (fotosCargadas) {
      console.log(`Fotos cargadas exitosamente para la ruta ${rutaId}`);
    } else {
      console.log(`No se pudieron cargar fotos para la ruta ${rutaId}`);
    }
  };

  // Open lightbox for image gallery
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Navigate through lightbox images
  const navigateLightbox = (direction) => {
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < imagenesPreview.length) {
      setLightboxIndex(newIndex);
    }
  };

  // Modificar la función de búsqueda para incluir precio y dificultad
  const handleBusqueda = (e) => {
    const termino = e.target.value.toLowerCase();
    setTerminoBusqueda(termino);
    
    if (!termino.trim()) {
      setRutasFiltradas(rutas);
      return;
    }
    
    const resultado = rutas.filter(ruta => {
      // Buscar por nombre de ruta
      const coincideNombre = ruta.nombreRuta.toLowerCase().includes(termino);
      
      // Buscar por precio (como texto para que coincida con lo que el usuario escribe)
      const precioCadena = String(ruta.precio);
      const coincidePrecio = precioCadena.includes(termino);
      
      // Buscar por dificultad
      const coincideDificultad = ruta.dificultad.toLowerCase().includes(termino);
      
      // Retornar true si coincide con cualquiera de los campos
      return coincideNombre || coincidePrecio || coincideDificultad;
    });
    
    setRutasFiltradas(resultado);
  };

  // Ocultar el footer cuando el modal de detalles está abierto
  useEffect(() => {
    const footer = document.querySelector('footer');
    const dashboardFooter = document.querySelector('.sticky.bottom-0.border-t.border-emerald-100');
    const estadoIndicator = document.querySelector('.fixed.bottom-4.right-4.z-50');
    const toastContainer = document.getElementById('rutas-toast');
    
    if (footer) {
      if (isDetailView) {
        footer.style.display = 'none';
      } else {
        footer.style.display = '';
      }
    }
    
    if (dashboardFooter) {
      if (isDetailView) {
        dashboardFooter.style.display = 'none';
      } else {
        dashboardFooter.style.display = '';
      }
    }
    
    if (estadoIndicator) {
      if (isDetailView) {
        estadoIndicator.style.display = 'none';
      } else {
        estadoIndicator.style.display = '';
      }
    }
    
    if (toastContainer) {
      if (isDetailView) {
        toastContainer.style.display = 'none';
      } else {
        toastContainer.style.display = '';
      }
    }
    
    // Limpieza al desmontar
    return () => {
      if (footer) {
        footer.style.display = '';
      }
      if (dashboardFooter) {
        dashboardFooter.style.display = '';
      }
      if (estadoIndicator) {
        estadoIndicator.style.display = '';
      }
      if (toastContainer) {
        toastContainer.style.display = '';
      }
    };
  }, [isDetailView]);

  return (
    <DashboardLayoutGuia>
      <div className="p-6">
        {/* Contenedor de Toast para mantener las alertas en esta página */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          limit={3}
          containerId="rutas-toast"
        />
        
        {/* Header with Title and Create Button */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-700 mb-2">Rutas Disponibles</h1>
            <p className="text-emerald-600">Rutas de turismo ecológico</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {/* Añadir el buscador aquí */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar rutas..."
                value={terminoBusqueda}
                onChange={handleBusqueda}
                className="pl-10 pr-4 py-2 w-full rounded-lg bg-white shadow-sm border border-emerald-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-emerald-500" size={18} />
            </div>
            
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded shadow-sm transition-colors"
            >
              <Filter size={18} />
              Filtros
            </button>
            
            <button
              onClick={fetchRutas}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded shadow-sm transition-colors"
              title="Recargar rutas"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {mostrarFiltros && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-emerald-100">
            <h2 className="text-xl font-semibold text-emerald-700 mb-4">Filtrar Rutas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Dificultad</label>
                <select
                  value={filtros.dificultad}
                  onChange={(e) => setFiltros({ ...filtros, dificultad: e.target.value })}
                  className="w-full p-2 bg-white text-gray-700 rounded border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todas</option>
                  <option value="Facil">Fácil</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Desafiante">Desafiante</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Duración</label>
                <select
                  value={filtros.duracion}
                  onChange={(e) => setFiltros({ ...filtros, duracion: e.target.value })}
                  className="w-full p-2 bg-white text-gray-700 rounded border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todas</option>
                  <option value="corta">Corta (hasta 2h)</option>
                  <option value="media">Media (2-4h)</option>
                  <option value="larga">Larga (más de 4h)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Tipo</label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                  className="w-full p-2 bg-white text-gray-700 rounded border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos</option>
                  <option value="Cabalgata">Cabalgata</option>
                  <option value="Caminata">Caminata</option>
                  <option value="Cabalgata y Caminata">Cabalgata y Caminata</option>
                </select>
              </div>
              
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  className="w-full p-2 bg-white text-gray-700 rounded border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Todos</option>
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={aplicarFiltros}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-emerald-600">Cargando rutas...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 shadow-sm">
            <p className="font-semibold">Error al cargar las rutas</p>
            <p>{error}</p>
            <button 
              onClick={fetchRutas}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow-sm transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}
        
        {/* Routes Grid */}
        <div className="mt-6">
          {!loading && !error && rutasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rutasFiltradas.map((ruta) => (
                <div 
                  key={ruta.idRuta || ruta.id} 
                  className="bg-white bg-gradient-to-br from-emerald-50 to-white rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-emerald-100 transition-all duration-300"
                >
                  <div className="h-48 bg-emerald-100 relative">
                    {cargandoFotos[ruta.idRuta] ? (
                      <div className="flex justify-center items-center h-full bg-emerald-50">
                        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                      </div>
                    ) : rutasConFotos[ruta.idRuta] && rutasConFotos[ruta.idRuta].length > 0 ? (
                      <img
                        src={rutasConFotos[ruta.idRuta][0]}
                        alt={ruta.nombreRuta}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                        <span className="text-6xl text-emerald-400">{getRouteTypeIcon(ruta.tipo)}</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <span className={`${getDifficultyColor(ruta.dificultad)} text-white text-xs px-2 py-1 rounded-full shadow-sm`}>
                        {ruta.dificultad}
                      </span>
                      <span className={`${ruta.estado === 'Activa' ? 'bg-green-500' : 'bg-red-500'} text-white text-xs px-2 py-1 rounded-full shadow-sm`}>
                        {ruta.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-emerald-800 truncate">{ruta.nombreRuta}</h3>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div>
                        <span className="block text-xs text-emerald-600">Duración</span>
                        <span>{ruta.duracion}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-emerald-600">Tipo</span>
                        <span>{ruta.tipo}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-emerald-600">Distancia</span>
                        <span>{ruta.distancia} km</span>
                      </div>
                      <div>
                        <span className="block text-xs text-emerald-600">Capacidad</span>
                        <span>{ruta.capacidadMaxima} personas</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100 shadow-sm">
                      <span className="block text-xs text-emerald-600">Precio</span>
                      <span className="text-emerald-700 font-semibold">$ {ruta.precio}</span>
                    </div>
                    
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{ruta.descripcion}</p>
                    
                    <button 
                      onClick={() => openDetailView(ruta)}
                      className="w-full mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !loading && !error ? (
            <div className="text-center py-16">
              <p className="text-emerald-300 text-xl mb-4">No hay rutas disponibles con los filtros seleccionados</p>
              <button 
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded text-white"
              >
                Limpiar filtros
              </button>
            </div>
          ) : null}
        </div>
        
        {/* Detail View */}
        {isDetailView && activeRoute && (
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="relative">
                <div className="h-64 md:h-80 overflow-hidden bg-emerald-50">
                  {cargandoFotos[activeRoute.idRuta || activeRoute.id] ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
                    </div>
                  ) : (rutasConFotos[activeRoute.idRuta || activeRoute.id]?.length > 0 || imagenesPreview.length > 0) ? (
                    <div className="relative h-full">
                      <div className="flex space-x-2 overflow-x-auto h-full p-2">
                        {(rutasConFotos[activeRoute.idRuta || activeRoute.id]?.length > 0 
                          ? rutasConFotos[activeRoute.idRuta || activeRoute.id] 
                          : imagenesPreview).map((foto, idx) => (
                          <div 
                            key={idx} 
                            className="h-full min-w-[300px] relative group cursor-pointer"
                          >
                            <img
                              src={foto}
                              alt={`${activeRoute.nombreRuta} - imagen ${idx + 1}`}
                              className="h-full w-full object-cover rounded"
                              onClick={() => openLightbox(idx)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/800x400?text=Imagen+no+disponible';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                      <span className="text-8xl text-emerald-300">{getRouteTypeIcon(activeRoute.tipo)}</span>
                    </div>
                  )}
                </div>
                
                {/* Close button */}
                <button
                  onClick={closeDetailView}
                  className="absolute top-4 right-4 bg-white bg-opacity-80 text-emerald-700 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-md"
                >
                  <X size={20} />
                </button>
                
                {/* Route type and difficulty */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className={`${getDifficultyColor(activeRoute.dificultad)} px-3 py-1 rounded-full flex items-center gap-1.5 text-white shadow-sm`}>
                    <Mountain size={16} />
                    {activeRoute.dificultad}
                  </span>
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full shadow-sm">
                    {activeRoute.tipo}
                  </span>
                </div>
                
                {/* Status badge */}
                <div className="absolute bottom-4 right-4">
                  <span className={`${activeRoute.estado === 'Activa' ? 'bg-green-500' : 'bg-red-500'} text-white px-3 py-1 rounded-full shadow-sm`}>
                    {activeRoute.estado}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-grow overflow-y-auto bg-white">
                <h2 className="text-3xl font-bold text-emerald-700 mb-3">{activeRoute.nombreRuta}</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-emerald-600 text-sm">Duración</p>
                    <p className="text-emerald-800 font-semibold">{activeRoute.duracion}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-emerald-600 text-sm">Distancia</p>
                    <p className="text-emerald-800 font-semibold">{activeRoute.distancia} km</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-emerald-600 text-sm">Capacidad</p>
                    <p className="text-emerald-800 font-semibold">{activeRoute.capacidadMaxima} personas</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-emerald-600 text-sm">Tipo</p>
                    <p className="text-emerald-800 font-semibold">{activeRoute.tipo}</p>
                  </div>
                </div>
                
                <div className="mb-6 bg-emerald-100 p-4 rounded-lg text-center">
                  <p className="text-emerald-600 text-sm mb-1">Precio por persona</p>
                  <p className="text-emerald-800 text-2xl font-bold">$ {activeRoute.precio}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-emerald-700 mb-2">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {activeRoute.descripcion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={imagenesPreview[lightboxIndex]} 
                alt="Vista ampliada"
                className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl"
              />
            </div>
            
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-80 text-emerald-700 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-md"
            >
              <X size={24} />
            </button>
            
            <button
              onClick={() => navigateLightbox(-1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-emerald-700 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-md"
              disabled={lightboxIndex === 0}
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={() => navigateLightbox(1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-emerald-700 p-3 rounded-full hover:bg-opacity-100 transition-all shadow-md"
              disabled={lightboxIndex === imagenesPreview.length - 1}
            >
              <ChevronRight size={24} />
            </button>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 text-emerald-800 px-4 py-2 rounded-full shadow-md">
              {lightboxIndex + 1} de {imagenesPreview.length}
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutGuia>
  );
};

export default VisualizarRutas;