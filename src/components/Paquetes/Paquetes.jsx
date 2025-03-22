import axios from 'axios';
import {
    Calendar,
    Clock, DollarSign,
    Eye,
    Map,
    Package,
    RefreshCw,
    Search,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

const GestionPaquetes = () => {
  // Estados para la gestión de paquetes
  const [paquetes, setPaquetes] = useState([]);
  const [paquetesFiltrados, setPaquetesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);


  const [error, setError] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  
  // Estados para las imágenes y vista detallada
  const [paquetesConFotos, setPaquetesConFotos] = useState({});
  const [cargandoFotos, setCargandoFotos] = useState({});
  const [isDetailView, setIsDetailView] = useState(false);
  const [activePaquete, setActivePaquete] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imagenesPreview, setImagenesPreview] = useState([]);

  // Función para obtener la lista de paquetes
  const fetchPaquetes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:10101/paquete/lista-paquetes');
      console.log('Paquetes cargados:', response.data);
      
      // Verificar la estructura de la respuesta
      const paquetesData = response.data.result || [];
      
      // Filtrar paquetes duplicados por idPaquete
      const paquetesUnicos = Array.isArray(paquetesData) 
        ? paquetesData.filter((paquete, index, self) => 
            index === self.findIndex(p => p.idPaquete === paquete.idPaquete)
          )
        : [];
      
      // Para cada paquete, obtener sus rutas asociadas
      const paquetesConRutas = await Promise.all(
        paquetesUnicos.map(async (paquete) => {
          if (paquete.idPaquete) {
            const rutasAsociadas = await obtenerRutasAsociadas(paquete.idPaquete);
            return {
              ...paquete,
              rutasAsociadas: rutasAsociadas
            };
          }
          return paquete;
        })
      );
      
      setPaquetes(paquetesConRutas);
      setPaquetesFiltrados(paquetesConRutas);
      
      // Obtener fotos para cada paquete
      if (Array.isArray(paquetesConRutas)) {
        paquetesConRutas.forEach(paquete => {
          if (paquete.idPaquete) {
            obtenerFotosPaquete(paquete.idPaquete);
          }
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar paquetes:', err);
      setError('No se pudieron cargar los paquetes. Por favor, intente de nuevo más tarde.');
      setLoading(false);
    }
  };

  // Función para obtener las fotos de un paquete
  const obtenerFotosPaquete = async (idPaquete) => {
    try {
      setCargandoFotos(prev => ({ ...prev, [idPaquete]: true }));
      
      const response = await axios.get(`http://localhost:10101/paquete/fotos-publicas/${idPaquete}`);
      
      // Extraer los datos de las fotos según la estructura de la respuesta
      let fotosArray = response.data;
      
      // Si la respuesta tiene una propiedad 'fotos', usar esa
      if (response.data && response.data.fotos && Array.isArray(response.data.fotos)) {
        fotosArray = response.data.fotos;
      }
      
      if (Array.isArray(fotosArray)) {
        // Formatear las imágenes para mostrarlas
        const fotosFormateadas = fotosArray.map(foto => {
          // Construir URL correctamente, verificando las posibles propiedades
          let imageUrl;
          
          // Verificar todas las posibles propiedades donde podría estar la URL
          if (foto.urlFoto) {
            imageUrl = foto.urlFoto;
          } else if (foto.fotoUrl) {
            imageUrl = foto.fotoUrl;
          } else if (foto.urlImagen) {
            imageUrl = foto.urlImagen;
          } else if (foto.url) {
            imageUrl = foto.url;
          } else if (foto.ruta) {
            imageUrl = `http://localhost:10101${foto.ruta}`;
          } else {
            // URL de fallback si no hay ninguna ruta válida
            imageUrl = '';
          }
          
          return {
            id: foto.id || foto.idFoto,
            url: imageUrl
          };
        });
        
        // Actualizar el estado con las fotos formateadas
        setPaquetesConFotos(prev => ({
          ...prev,
          [idPaquete]: fotosFormateadas
        }));
      } else {
        setPaquetesConFotos(prev => ({
          ...prev,
          [idPaquete]: []
        }));
      }
    } catch (err) {
      console.error('Error al obtener fotos del paquete:', err);
      setPaquetesConFotos(prev => ({
        ...prev,
        [idPaquete]: []
      }));
    } finally {
      setCargandoFotos(prev => ({ ...prev, [idPaquete]: false }));
    }
  };

  // Función para obtener información de las rutas asociadas
  const obtenerRutasAsociadas = async (idPaquete) => {
    try {
      console.log('Obteniendo rutas para el paquete:', idPaquete);
      
      // Intentar obtener el paquete directamente por ID
      const response = await axios.get(`http://localhost:10101/paquete/obtener-paquete/${idPaquete}`);
      console.log('Respuesta de obtener-paquete:', response.data);
      
      // Verificar si la respuesta es un array
      if (response.data && Array.isArray(response.data)) {
        // La respuesta es un array, extraer todas las rutas
        const rutasInfo = [];
        
        // Recorrer cada elemento del array para extraer información de rutas
        response.data.forEach(item => {
          // Agregar cada ruta del array sin filtrar por ID
          rutasInfo.push({
            idRuta: item.idRuta,
            nombreRuta: item.nombreRuta || `Ruta ${item.idRuta}`
          });
        });
        
        console.log('Rutas encontradas:', rutasInfo);
        return rutasInfo;
      } else if (response.data && typeof response.data === 'object') {
        // Si la respuesta es un objeto único, buscar rutas en él
        const rutasInfo = [];
        
        // Verificar si el objeto tiene propiedades de ruta
        if (response.data.idRuta || response.data.nombreRuta) {
          rutasInfo.push({
            idRuta: response.data.idRuta,
            nombreRuta: response.data.nombreRuta || `Ruta ${response.data.idRuta}`
          });
        }
        
        // Verificar si hay un array de rutas en alguna propiedad
        if (response.data.rutas && Array.isArray(response.data.rutas)) {
          response.data.rutas.forEach(ruta => {
            if (!rutasInfo.some(r => r.idRuta === ruta.idRuta)) {
              rutasInfo.push({
                idRuta: ruta.idRuta,
                nombreRuta: ruta.nombreRuta || `Ruta ${ruta.idRuta}`
              });
            }
          });
        }
        
        // Si encontramos rutas, retornar el array
        if (rutasInfo.length > 0) {
          console.log('Rutas encontradas:', rutasInfo);
          return rutasInfo;
        } else {
          // Si no hay rutas en la respuesta, mostrar mensaje
          console.log('No se encontraron rutas en la respuesta');
          return [];
        }
      } else {
        console.log('Formato de respuesta no reconocido');
        return [];
      }
    } catch (err) {
      console.error('Error al obtener rutas asociadas:', err);
      return [];
    }
  };

  // Cargar paquetes al montar el componente
  useEffect(() => {
    fetchPaquetes();
  }, []);

  // Función para manejar búsqueda
  const handleSearchChange = (e) => {
    setTerminoBusqueda(e.target.value);
    
    if (e.target.value.trim() === '') {
      setPaquetesFiltrados(paquetes);
    } else {
      const termino = e.target.value.toLowerCase().trim();
      const resultados = paquetes.filter(paquete => 
        paquete.nombrePaquete.toLowerCase().includes(termino) ||
        paquete.descripcion.toLowerCase().includes(termino)
      );
      setPaquetesFiltrados(resultados);
    }
  };

  // Función para formatear fechas
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible';
    
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para mostrar precio formateado
  const mostrarPrecio = (precio) => {
    if (!precio) return '$0';
    return `$${parseInt(precio).toLocaleString('es-CO')}`;
  };

  // Función para obtener un ícono según el tipo de paquete
  const getPackageIcon = () => {
    return <Package className="w-16 h-16 text-emerald-600" />;
  };

  // Función para abrir la vista detallada
  const openDetailView = async (paquete) => {
    setActivePaquete(paquete);
    setIsDetailView(true);
    
    // Si no tenemos fotos de este paquete, las obtenemos
    if (!paquetesConFotos[paquete.idPaquete]) {
      obtenerFotosPaquete(paquete.idPaquete);
    }
    
    // Obtener rutas asociadas al paquete
    const rutas = await obtenerRutasAsociadas(paquete.idPaquete);
    
    // Actualizar el paquete activo con las rutas obtenidas
    setActivePaquete(prevPaquete => ({
      ...prevPaquete,
      rutasAsociadas: rutas
    }));
  };

  // Función para cerrar la vista detallada
  const closeDetailView = () => {
    setIsDetailView(false);
    setActivePaquete(null);
  };

  // Función para abrir el lightbox
  const handleLightbox = (imagenes, index) => {
    setImagenesPreview(imagenes);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Función para navegar entre imágenes en el lightbox
  const navigateLightbox = (direction) => {
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < imagenesPreview.length) {
      setLightboxIndex(newIndex);
    }
  };

  // Componente para renderizar la vista detallada
  const DetallePaquete = ({ paquete, onClose, imagenes = [] }) => {
    // Obtener nombres de rutas
    const getNombresRutas = () => {
      if (!paquete.rutasAsociadas || !paquete.rutasAsociadas.length) return 'Ninguna ruta asociada';
      
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {paquete.rutasAsociadas.map((ruta, index) => (
            <div key={index} className="flex items-center gap-2 bg-emerald-50  p-2 rounded">
              <Map size={16} className="text-emerald-400" />
              <span>{ruta.nombreRuta}</span>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl text-gray-800 animate-fadeIn max-h-[90vh] overflow-y-auto">
          <div className="relative">
            {/* Encabezado con fondo de imagen (si hay imágenes) */}
            <div className="h-48 bg-emerald-900 rounded-t-lg overflow-hidden relative">
              {imagenes && imagenes.length > 0 ? (
                <div className="w-full h-full overflow-hidden">
                  <img 
                    src={imagenes[0].url} 
                    alt={paquete.nombrePaquete}
                    className="w-full h-full object-cover object-center opacity-60 cursor-pointer"
                    onClick={() => handleLightbox(imagenes.map(img => img.url), 0)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                      const placeholder = document.createElement('div');
                      placeholder.innerHTML = `
                        <div class="text-emerald-400 text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                          </svg>
                          <p>Imagen no disponible</p>
                        </div>
                      `;
                      e.target.parentNode.appendChild(placeholder);
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package size={64} className="text-emerald-600" />
                </div>
              )}
              
              {/* Botón de cierre */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <X size={24} />
              </button>
              
              {/* Nombre del paquete */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-emerald-900 to-transparent">
                <h2 className="text-3xl font-bold text-white">{paquete.nombrePaquete}</h2>
              </div>
            </div>
            
            <div className="p-6">
              {/* Información principal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="col-span-2">
                  <h3 className="text-xl font-semibold mb-2 text-emerald-700">Descripción</h3>
                  <p className="text-gray-700 mb-6">{paquete.descripcion}</p>
                  
                  <h3 className="text-xl font-semibold mb-2 text-emerald-700">Rutas incluidas</h3>
                  {getNombresRutas()}
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-emerald-700 font-medium mb-1">Duración</h4>
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-emerald-600" />
                        <span className="text-lg text-gray-800">{paquete.duracion}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-emerald-700 font-medium mb-1">Tipo</h4>
                      <div className="flex items-center gap-2">
                        <Map size={18} className="text-emerald-600" />
                        <span className="text-lg text-gray-800">Cabalgata y Caminata</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-emerald-700 font-medium mb-1">Precio</h4>
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-emerald-600" />
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-800">${paquete.precio}</span>
                          {paquete.descuento > 0 && (
                            <span className="ml-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                              {paquete.descuento}% desc.
                            </span>
                          )}
                        </div>
                      </div>
                      {paquete.descuento > 0 && (
                        <div className="text-emerald-700 mt-1 text-sm">
                          Precio final: ${(paquete.precio * (1 - paquete.descuento / 100)).toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                   
                  </div>
                </div>
              </div>
              
              {/* Galería de imágenes */}
              {imagenes && imagenes.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-3 text-emerald-700">Galería de imágenes</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {imagenes.map((imagen, index) => (
                      <div 
                        key={index} 
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleLightbox(imagenes.map(img => img.url), index)}
                      >
                        <div className="w-full h-full overflow-hidden">
                          <img 
                            src={imagen.url} 
                            alt={`Imagen ${index + 1} del paquete`}
                            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.parentNode.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-emerald-50">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="2" y="6" width="20" height="12" rx="2"/>
                                    <circle cx="12" cy="12" r="2"/>
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Botón de acción */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-emerald-200 hover:bg-emerald-400 text-gray-950 rounded-lg transition-colors shadow-md"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-gray-800 container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Paquetes Turísticos</h1>
          <p className="text-emerald-700 mt-1">Descubre nuestras experiencias más completas</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar paquetes..."
              value={terminoBusqueda}
              onChange={handleSearchChange}
              className="w-full md:w-64 px-4 py-2 bg-emerald-50 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-emerald-700"
            />
            <Search className="absolute right-3 top-2.5 text-emerald-700 w-5 h-5" />
          </div>
          
          <button
            onClick={fetchPaquetes}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded transition-colors"
            title="Recargar paquetes"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      {/* Vista detallada o lista de paquetes */}
      {isDetailView ? (
        <DetallePaquete
          paquete={activePaquete}
          onClose={closeDetailView}
          imagenes={paquetesConFotos[activePaquete.idPaquete] || []}
        />
      ) : (
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-rose-900 bg-opacity-30 text-white p-4 rounded-lg">
              <p className="text-center">{error}</p>
            </div>
          ) : paquetesFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paquetesFiltrados.map((paquete, index) => (
                <div 
                  key={`paquete-${paquete.idPaquete || paquete.id || index}`} 
                  className="bg-emerald-50 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-emerald-900/30 transition-all"
                >
                  <div className="h-48 bg-emerald-950 relative overflow-hidden">
                    {cargandoFotos[paquete.idPaquete] ? (
                      <div className="flex justify-center items-center h-full bg-emerald-950">
                        <div className="animate-spin w-8 h-8 border-2 border-emerald-300 border-t-transparent rounded-full"></div>
                      </div>
                    ) : paquetesConFotos[paquete.idPaquete] && paquetesConFotos[paquete.idPaquete].length > 0 ? (
                      <div className="w-full h-full overflow-hidden">
                        <img
                          src={paquetesConFotos[paquete.idPaquete][0].url}
                          alt={paquete.nombrePaquete}
                          className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentNode.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-emerald-950">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                                  <circle cx="12" cy="12" r="2"/>
                                  <path d="M14.5 12l2.5 -2.5"/>
                                  <path d="M14.5 12l2.5 2.5"/>
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={64} className="text-emerald-600" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => openDetailView(paquete)}
                        className="p-2 bg-emerald-800 bg-opacity-80 hover:bg-emerald-700 text-white rounded-full"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                    
                    <div className="absolute bottom-2 left-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        paquete.estado === 'Activo' ? 'bg-emerald-500 text-emerald-900' : 'bg-red-500 text-red-900'
                      }`}>
                        {paquete.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 truncate">{paquete.nombrePaquete}</h3>
                    
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Clock size={16} />
                        <span>{paquete.duracion}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Calendar size={16} />
                        <span>{formatearFecha(paquete.fechaInicio)} - {formatearFecha(paquete.fechaFin)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-emerald-700">
                        <DollarSign size={16} />
                        <span>{mostrarPrecio(paquete.precio)}</span>
                        {paquete.descuento > 0 && (
                          <span className="bg-emerald-600 text-white text-xs px-1 rounded">
                            {paquete.descuento}% desc.
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Map size={16} />
                        <span>{paquete.rutasAsociadas?.length || 0} rutas incluidas</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-50 text-center p-8 rounded-lg border border-emerald-100">
              <div className="flex justify-center mb-4">
                {getPackageIcon()}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay paquetes disponibles</h3>
              <p className="text-emerald-700">No se encontraron paquetes turísticos.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Lightbox para imágenes */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={imagenesPreview[lightboxIndex]} 
              alt="Vista ampliada"
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
          
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <X size={24} />
          </button>
          
          <button
            onClick={() => navigateLightbox(-1)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <button
            onClick={() => navigateLightbox(1)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
            {lightboxIndex + 1} de {imagenesPreview.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPaquetes;

