import { useState, useEffect } from 'react';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import axios from 'axios';
import { 
  Plus, Search, Filter, Eye, 
  Package, Calendar, Map, Clock, DollarSign, Pencil, Trash, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CrearPaquetes from './CrearPaquetes';
import ActualizarPaquetes from './ActualizarPaquetes';
import EliminarPaquetes from './EliminarPaquetes';

// Añadir esta línea para limpiar cualquier toast previo
toast.dismiss();

const GestionPaquetes = () => {
  // Estados para la gestión de paquetes
  const [paquetes, setPaquetes] = useState([]);
  const [paquetesFiltrados, setPaquetesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    duracion: '',
    precio: '',
    estado: ''
  });
  
  // Estados para los modales
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalActualizarOpen, setModalActualizarOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
  
  // Estados para las imágenes
  const [paquetesConFotos, setPaquetesConFotos] = useState({});

  // Añadir estos estados para manejar alertas personalizadas
  const [alertaPersonalizada, setAlertaPersonalizada] = useState({
    visible: false,
    mensaje: '',
    tipo: '' // 'success', 'error', 'info'
  });

  // Añadir este estado para el modal de vista detallada
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);

  // Añadir estos estados para el lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imagenesPreview, setImagenesPreview] = useState([]);

  // Función para obtener la lista de paquetes
  const fetchPaquetes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://servicio-explococora.onrender.com/paquete/lista-paquetes');
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
      
      // Asegurar que se use el containerId correcto
      toast.error('No se pudieron cargar los paquetes', {
        containerId: 'gestion-paquetes'
      });
    }
  };

  // Función para obtener rutas disponibles
  const fetchRutas = async () => {
    try {
      const response = await axios.get('https://servicio-explococora.onrender.com/rutas');
      setRutasDisponibles(response.data);
    } catch (err) {
      console.error('Error al cargar rutas:', err);
      
      // Asegurar que se use el containerId correcto
      toast.error('No se pudieron cargar las rutas disponibles', {
        containerId: 'gestion-paquetes'
      });
    }
  };

  // Función para obtener las fotos de un paquete
  const obtenerFotosPaquete = async (idPaquete) => {
    try {
      const response = await axios.get(`https://servicio-explococora.onrender.com/paquete/fotos-publicas/${idPaquete}`);
      
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
            imageUrl = `https://servicio-explococora.onrender.com${foto.ruta}`;
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
    } catch {
      setPaquetesConFotos(prev => ({
        ...prev,
        [idPaquete]: []
      }));
    }
  };

  // Función para obtener información de las rutas asociadas
  const obtenerRutasAsociadas = async (idPaquete) => {
    try {
      console.log('Obteniendo rutas para el paquete:', idPaquete);
      
      // Intentar obtener el paquete directamente por ID
      const response = await axios.get(`https://servicio-explococora.onrender.com/paquete/obtener-paquete/${idPaquete}`);
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
    } catch (error) {
      console.error('Error al obtener rutas asociadas:', error);
      return [];
    }
  };

  // Cargar paquetes y rutas al montar el componente
  useEffect(() => {
    // Limpiar todas las notificaciones cuando se monte el componente
    toast.dismiss();
    
    // Cargar paquetes y rutas al montar el componente
    fetchPaquetes();
    fetchRutas();
    
    // Función para limpiar al desmontar
    return () => {
      toast.dismiss();
    };
  }, []);

  // Función para abrir el modal de creación
  const handleOpenCrearModal = () => {
    setModalCrearOpen(true);
  };

  // Función para abrir el modal de actualización
  const handleOpenActualizarModal = (paquete) => {
    setPaqueteSeleccionado(paquete);
    setModalActualizarOpen(true);
  };

  // Función para abrir el modal de eliminación
  const handleOpenEliminarModal = (paquete) => {
    setPaqueteSeleccionado(paquete);
    setModalEliminarOpen(true);
  };

  // Función para abrir el modal de vista detallada
  const handleOpenDetalleModal = (paquete) => {
    setPaqueteSeleccionado(paquete);
    setModalDetalleOpen(true);
  };

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    let resultado = [...paquetes];
    
    // Filtrar por duración
    if (filtros.duracion) {
      resultado = resultado.filter(paquete => 
        paquete.duracion && paquete.duracion.toLowerCase().includes(filtros.duracion.toLowerCase())
      );
    }
    
    // Filtrar por precio máximo
    if (filtros.precio) {
      resultado = resultado.filter(paquete => 
        paquete.precio && parseFloat(paquete.precio) <= parseFloat(filtros.precio)
      );
    }
    
    // Filtrar por estado
    if (filtros.estado) {
      resultado = resultado.filter(paquete => 
        paquete.estado === filtros.estado
      );
    }
    
    setPaquetesFiltrados(resultado);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      duracion: '',
      precio: '',
      estado: ''
    });
    setPaquetesFiltrados(paquetes);
  };

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

  // Función para mostrar alertas personalizadas
  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlertaPersonalizada({
      visible: true,
      mensaje,
      tipo
    });
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      setAlertaPersonalizada(prev => ({...prev, visible: false}));
    }, 3000);
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

  // Función para mostrar el tipo de ruta
  const mostrarTipoRuta = (paquete) => {
    if (!paquete.rutasAsociadas || paquete.rutasAsociadas.length === 0) return 'Tipo no disponible';
    
    // Obtener todos los tipos de ruta únicos
    const tiposUnicos = Array.from(new Set(paquete.rutasAsociadas.map(r => r.tipoRuta || 'Cabalgata y Caminata')));
    
    // Devolver los tipos separados por coma
    return tiposUnicos.join(', ');
  };

  // Calcular la duración total de las rutas de un paquete
  const calcularDuracionTotalPaquete = (paquete) => {
    if (!paquete.rutasAsociadas || !paquete.rutasAsociadas.length) return paquete.duracion || 'No especificada';
    
    let horasTotales = 0;
    let minutosTotales = 0;
    
    paquete.rutasAsociadas.forEach(ruta => {
      if (ruta.tiempoEstimado) {
        const tiempo = ruta.tiempoEstimado.toLowerCase();
        
        // Extraer horas
        const horasMatch = tiempo.match(/(\d+)\s*(?:h|hora|horas)/);
        if (horasMatch) horasTotales += parseInt(horasMatch[1]);
        
        // Extraer minutos
        const minutosMatch = tiempo.match(/(\d+)\s*(?:m|min|minuto|minutos)/);
        if (minutosMatch) minutosTotales += parseInt(minutosMatch[1]);
      }
    });
    
    // Convertir minutos excedentes a horas
    if (minutosTotales >= 60) {
      horasTotales += Math.floor(minutosTotales / 60);
      minutosTotales = minutosTotales % 60;
    }
    
    // Formar el string de duración total
    let duracionTotal = '';
    if (horasTotales > 0) duracionTotal += `${horasTotales} hora${horasTotales !== 1 ? 's' : ''}`;
    if (minutosTotales > 0) {
      if (duracionTotal) duracionTotal += ' ';
      duracionTotal += `${minutosTotales} minuto${minutosTotales !== 1 ? 's' : ''}`;
    }
    
    return duracionTotal || paquete.duracion || 'No especificada';
  };

  return (
    <DashboardLayoutAdmin>
      <div className="min-h-screen text-gray-800">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Paquetes Turísticos</h1>
            <p className="text-emerald-600 mt-1">Administre los paquetes turísticos disponibles</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar paquetes..."
                value={terminoBusqueda}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg bg-white shadow-sm border border-emerald-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
              onClick={handleOpenCrearModal}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-md shadow-sm flex items-center gap-2"
            >
              <Plus size={20} />
              <span>Nuevo Paquete</span>
            </button>
          </div>
        </div>
        
        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-emerald-100">
            <h2 className="text-xl font-semibold text-emerald-700 mb-4">Filtrar Paquetes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Duración</label>
                <input
                  type="text"
                  placeholder="Ej: 3 días"
                  value={filtros.duracion}
                  onChange={(e) => setFiltros({...filtros, duracion: e.target.value})}
                  className="w-full p-2 rounded bg-white border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Precio Máximo</label>
                <input
                  type="number"
                  placeholder="Precio máximo"
                  value={filtros.precio}
                  onChange={(e) => setFiltros({...filtros, precio: e.target.value})}
                  className="w-full p-2 rounded bg-white border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              
              <div>
                <label className="block text-emerald-600 text-sm mb-1">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                  className="w-full p-2 rounded bg-white border border-emerald-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Todos</option>
                  <option value="Activo">Activos</option>
                  <option value="Inactivo">Inactivos</option>
                </select>
              </div>
              
              <div className="flex items-end gap-2">
                <button 
                  onClick={aplicarFiltros}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors"
                >
                  Aplicar Filtros
                </button>
                <button 
                  onClick={limpiarFiltros}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Vista principal: Lista de paquetes */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-rose-100 text-rose-700 p-4 rounded-lg border border-rose-200">
              <p className="text-center">{error}</p>
            </div>
          ) : paquetesFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {paquetesFiltrados.map(paquete => (
                <div 
                  key={paquete.idPaquete} 
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="relative h-52">
                    {paquetesConFotos[paquete.idPaquete] && paquetesConFotos[paquete.idPaquete].length > 0 ? (
                      <div className="w-full h-full overflow-hidden">
                        <img
                          src={paquetesConFotos[paquete.idPaquete][0].url}
                          alt={paquete.nombrePaquete}
                          className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentNode.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-emerald-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0D8ABC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                        <Package size={64} className="text-emerald-700" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleOpenActualizarModal(paquete)}
                        className="p-2 bg-white bg-opacity-90 hover:bg-emerald-50 text-emerald-700 rounded-full shadow-sm transition-colors"
                        title="Editar paquete"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenEliminarModal(paquete)}
                        className="p-2 bg-white bg-opacity-90 hover:bg-red-50 text-red-600 rounded-full shadow-sm transition-colors"
                        title="Eliminar paquete"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                    
                    <div className="absolute bottom-2 left-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        paquete.estado === 'Activo' ? 'bg-emerald-700 text-white' : 'bg-red-500 text-white'
                      } shadow-sm`}>
                        {paquete.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-grow">
                    <h3 className="text-lg font-bold text-emerald-800 truncate">{paquete.nombrePaquete}</h3>
                    
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={18} className="text-emerald-700" />
                        <span>{paquete.duracion}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={18} className="text-emerald-700" />
                        <span>{formatearFecha(paquete.fechaInicio)} - {formatearFecha(paquete.fechaFin)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign size={18} className="text-emerald-700" />
                        <span>{mostrarPrecio(paquete.precio)}</span>
                        {paquete.descuento > 0 && (
                          <span className="bg-emerald-700 text-white text-xs px-1 rounded">
                            {paquete.descuento}% desc.
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Map size={18} className="text-emerald-700" />
                        <span>{paquete.rutasAsociadas?.length || 0} rutas incluidas</span>
                      </div>
                    </div>
                    
                    <div className="mt-5">
                      <button
                        onClick={() => handleOpenDetalleModal(paquete)}
                        className="w-full py-2.5 text-sm bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={18} />
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-50 text-center p-8 rounded-lg border border-emerald-100">
              <div className="flex justify-center mb-4">
                <Package size={64} className="text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay paquetes disponibles</h3>
              <p className="text-emerald-600 mb-6">No se encontraron paquetes turísticos. ¿Desea crear uno nuevo?</p>
              <button
                onClick={handleOpenCrearModal}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors"
              >
                Crear Nuevo Paquete
              </button>
            </div>
          )}
        </div>
        
        {/* Modales para Crear, Actualizar y Eliminar */}
        {modalCrearOpen && (
          <CrearPaquetes
            onClose={() => setModalCrearOpen(false)} 
            onCreated={fetchPaquetes}
            rutasDisponibles={rutasDisponibles}
            mostrarAlerta={mostrarAlerta}
          />
        )}
        
        {modalActualizarOpen && paqueteSeleccionado && (
          <ActualizarPaquetes
            onClose={() => setModalActualizarOpen(false)}
            onUpdated={fetchPaquetes}
            paquete={paqueteSeleccionado}
            rutasDisponibles={rutasDisponibles}
            mostrarAlerta={mostrarAlerta}
          />
        )}
        
        {modalEliminarOpen && paqueteSeleccionado && (
          <EliminarPaquetes
            onClose={() => setModalEliminarOpen(false)}
            onDeleted={fetchPaquetes}
            paquete={paqueteSeleccionado}
            mostrarAlerta={mostrarAlerta}
          />
        )}

        {/* Reemplazar el modal existente con este componente DetallePaquete */}
        {modalDetalleOpen && paqueteSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl text-gray-800 animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="relative">
                {/* Encabezado con fondo de imagen (si hay imágenes) */}
                <div className="h-48 bg-emerald-100 rounded-t-lg overflow-hidden relative">
                  {paquetesConFotos[paqueteSeleccionado.idPaquete] && paquetesConFotos[paqueteSeleccionado.idPaquete].length > 0 ? (
                    <div className="w-full h-full overflow-hidden">
                      <img 
                        src={paquetesConFotos[paqueteSeleccionado.idPaquete][0].url} 
                        alt={paqueteSeleccionado.nombrePaquete}
                        className="w-full h-full object-cover object-center opacity-60 cursor-pointer"
                        onClick={() => handleLightbox(paquetesConFotos[paqueteSeleccionado.idPaquete].map(img => img.url), 0)}
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
                      <Package size={64} className="text-emerald-200" />
                    </div>
                  )}
                  
                  {/* Botón de cierre */}
                  <button
                    onClick={() => setModalDetalleOpen(false)}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <X size={24} />
                  </button>
                  
                  {/* Nombre del paquete */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-transparent">
                    <h2 className="text-3xl font-bold text-gray-800">{paqueteSeleccionado.nombrePaquete}</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Información principal */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="col-span-2">
                      <h3 className="text-xl font-semibold mb-2 text-emerald-600">Descripción</h3>
                      <p className="text-gray-700 mb-6">{paqueteSeleccionado.descripcion}</p>
                      
                      <h3 className="text-xl font-semibold mb-2 text-emerald-600">Rutas incluidas</h3>
                      {paqueteSeleccionado.rutasAsociadas && paqueteSeleccionado.rutasAsociadas.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {paqueteSeleccionado.rutasAsociadas.map((ruta, index) => (
                            <div key={index} className="flex items-center gap-2 bg-emerald-100 p-2 rounded">
                              <Map size={16} className="text-emerald-400" />
                              <div>
                                <span className="font-medium">{ruta.nombreRuta}</span>
                                {ruta.tiempoEstimado && (
                                  <div className="text-xs text-emerald-700 flex items-center mt-1">
                                    <Clock size={12} className="mr-1" />
                                    <span>{ruta.tiempoEstimado}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No hay rutas asociadas a este paquete.</p>
                      )}
                    </div>
                    
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-emerald-700 font-medium mb-1">Duración</h4>
                          <div className="flex items-center gap-2">
                            <Clock size={18} className="text-emerald-600" />
                            <span className="text-lg text-gray-800">{calcularDuracionTotalPaquete(paqueteSeleccionado)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-emerald-700 font-medium mb-1">Tipo</h4>
                          <div className="flex items-center gap-2">
                            <Map size={18} className="text-emerald-600" />
                            <span>{mostrarTipoRuta(paqueteSeleccionado)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-emerald-700 font-medium mb-1">Precio</h4>
                          <div className="flex items-center gap-2">
                            <DollarSign size={18} className="text-emerald-600" />
                            <div className="flex items-center">
                              <span className="text-2xl font-bold text-gray-800">${paqueteSeleccionado.precio}</span>
                              {paqueteSeleccionado.descuento > 0 && (
                                <span className="ml-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                                  {paqueteSeleccionado.descuento}% desc.
                                </span>
                              )}
                            </div>
                          </div>
                          {paqueteSeleccionado.descuento > 0 && (
                            <div className="text-emerald-700 mt-1 text-sm">
                              Precio final: ${(paqueteSeleccionado.precio * (1 - paqueteSeleccionado.descuento / 100)).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Galería de imágenes */}
                  {paquetesConFotos[paqueteSeleccionado.idPaquete] && paquetesConFotos[paqueteSeleccionado.idPaquete].length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-3 text-emerald-700">Galería de imágenes</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {paquetesConFotos[paqueteSeleccionado.idPaquete].map((imagen, index) => (
                          <div 
                            key={index} 
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleLightbox(paquetesConFotos[paqueteSeleccionado.idPaquete].map(img => img.url), index)}
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
                  
                  {/* Botones de acción */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      onClick={() => setModalDetalleOpen(false)}
                      className="px-6 py-2 bg-emerald-100 hover:bg-emerald-200 text-gray-800 rounded-lg transition-colors shadow-md"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => {
                        setModalDetalleOpen(false);
                        handleOpenActualizarModal(paqueteSeleccionado);
                      }}
                      className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors shadow-md flex items-center gap-2"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={() => navigateLightbox(1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronRight size={24} />
            </button>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
              {lightboxIndex + 1} de {imagenesPreview.length}
            </div>
          </div>
        )}

        {/* Alerta personalizada */}
        {alertaPersonalizada.visible && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fadeIn ${
            alertaPersonalizada.tipo === 'success' ? 'bg-green-500 text-white' :
            alertaPersonalizada.tipo === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {alertaPersonalizada.tipo === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {alertaPersonalizada.tipo === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span>{alertaPersonalizada.mensaje}</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutAdmin>
  );
};

export default GestionPaquetes;
