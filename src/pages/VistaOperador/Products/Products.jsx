import { useEffect, useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import axios from 'axios';
import { Users, UserCheck, UserMinus, RefreshCw, Clock, Eye, X } from 'lucide-react';

const Products = () => {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [guiaSeleccionado, setGuiaSeleccionado] = useState(null);
  
  // Estado para los contadores
  const [contadores, setContadores] = useState({
    disponibles: 0,
    ocupados: 0,
    inactivos: 0,
    total: 0
  });
  
  // Configuración para el servidor
  const API_URL = 'http://localhost:10101';
  const API_PATH = '/usuarios/listar-por-rol/guia';
  const API_CONTADOR_PATH = '/usuarios/contar-por-estado';

  // Función para construir nombre completo
  const construirNombreCompleto = (guiaData) => {
    if (!guiaData) return "Guía";
    
    // Intentar obtener el nombre de todas las posibles propiedades
    const primerNombre = guiaData.primerNombre || guiaData.nombre || guiaData.name || "";
    const segundoNombre = guiaData.segundoNombre || "";
    const primerApellido = guiaData.primerApellido || guiaData.apellido || guiaData.lastName || "";
    const segundoApellido = guiaData.segundoApellido || "";
    
    // Si tenemos un nombre completo ya formateado, usarlo
    if (guiaData.nombreCompleto) return guiaData.nombreCompleto;
    
    // Si tenemos un valor en nombre que ya podría ser el nombre completo
    if (guiaData.nombre && guiaData.nombre.includes(" ") && !primerApellido) {
      return guiaData.nombre;
    }
    
    // Construir el nombre completo con los componentes individuales
    const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.replace(/\s+/g, ' ').trim();
    
    // Si después de todo no tenemos un nombre, mostrar "Guía"
    return nombreCompleto || "Guía";
  };

  // Función para obtener contadores de estados
  const obtenerContadores = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_URL}${API_CONTADOR_PATH}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data && response.data.data.guias) {
        const guiasData = response.data.data.guias;
        
        // Inicializar contadores en 0
        const nuevoConteo = {
          disponibles: 0,
          ocupados: 0,
          inactivos: 0,
          total: 0
        };
        
        // Actualizar contadores según los datos recibidos
        guiasData.forEach(item => {
          if (item.estado === 'disponible') nuevoConteo.disponibles = item.cantidad;
          if (item.estado === 'ocupado') nuevoConteo.ocupados = item.cantidad;
          if (item.estado === 'inactivo') nuevoConteo.inactivos = item.cantidad;
        });
        
        // Calcular total
        nuevoConteo.total = nuevoConteo.disponibles + nuevoConteo.ocupados + nuevoConteo.inactivos;
        
        setContadores(nuevoConteo);
      }
    } catch (err) {
      console.error("Error al obtener contadores:", err);
    }
  };

  const obtenerEstadosGuias = async () => {
    try {
      setActualizando(true);
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación disponible');
        setGuias([]);
        return;
      }
      
      const urlCompleta = `${API_URL}${API_PATH}`;
      
      const response = await axios.get(urlCompleta, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      let guiasData = [];
      
      if (response.data && response.data.usuarios) {
        guiasData = response.data.usuarios;
      } else if (response.data && Array.isArray(response.data)) {
        guiasData = response.data;
      } else {
        setGuias([]);
        setError('La respuesta del servidor no tiene el formato esperado');
        return;
      }
      
      // Intentar obtener más información de cada guía
      const guiasPromises = guiasData.map(async (guia) => {
        try {
          // Intentar obtener el perfil completo si tenemos cédula o id
          if (guia.cedula || guia.documento || guia._id || guia.id) {
            const cedulaOId = guia.cedula || guia.documento || guia._id || guia.id;
            
            try {
              const perfilResponse = await axios.get(`${API_URL}/guia/perfil-completo/${cedulaOId}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (perfilResponse.data && (perfilResponse.data.data || perfilResponse.data)) {
                const perfilData = perfilResponse.data.data || perfilResponse.data;
                return {...guia, ...perfilData};
              }
            } catch (error) {
              // Si falla, continuamos con la información básica
              console.log("No se pudo obtener perfil detallado:", error.message);
            }
          }
          
          return guia;
        } catch {
          // En caso de error, devolvemos la información básica
          return guia;
        }
      });
      
      const guiasActualizados = await Promise.all(guiasPromises);
      
      setGuias(guiasActualizados);
      await obtenerContadores();
      
      setError(null);
      setUltimaActualizacion(new Date());
    } catch (err) {
      console.error("Error al obtener estados de guías:", err);
      
      let mensajeError = 'Error al cargar los datos. Por favor, intenta de nuevo.';
      
      if (err.response) {
        mensajeError = `Error ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        mensajeError = 'No se recibió respuesta del servidor';
      } else {
        mensajeError = err.message || 'Error desconocido al conectar con el servidor';
      }
      
      setError(mensajeError);
      setGuias([]);
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    obtenerEstadosGuias();

    // Actualización en tiempo real cada 10 segundos
    const intervalo = setInterval(() => {
      obtenerEstadosGuias();
    }, 10000);

    return () => clearInterval(intervalo);
  }, []); 

  // Función para abrir el modal de detalles
  const verDetalles = (guia) => {
    setGuiaSeleccionado(guia);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setGuiaSeleccionado(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 transition-all duration-300 transform">
        {/* Panel superior con estadísticas */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-600">
            <h1 className="text-2xl font-bold text-white">Estado de Guías</h1>
            <p className="text-emerald-100 text-sm">Monitoreo y control de disponibilidad</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4">
            {/* Total de Guías */}
            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total</p>
                  <h2 className="text-3xl font-bold text-gray-800 mt-1">{contadores.total}</h2>
                </div>
                <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </div>
            
            {/* Guías Disponibles */}
            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Disponibles</p>
                  <h2 className="text-3xl font-bold text-emerald-600 mt-1">{contadores.disponibles}</h2>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
            
            {/* Guías Ocupados */}
            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Ocupados</p>
                  <h2 className="text-3xl font-bold text-amber-600 mt-1">{contadores.ocupados}</h2>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>
            
            {/* Guías Inactivos */}
            <div className="p-5 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Inactivos</p>
                  <h2 className="text-3xl font-bold text-gray-500 mt-1">{contadores.inactivos}</h2>
                </div>
                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <UserMinus className="h-6 w-6 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-3 bg-gray-50 flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Actualización automática cada 10s</span>
            </div>
            <button 
              onClick={obtenerEstadosGuias}
              disabled={actualizando}
              className={`
                inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium
                ${actualizando 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-200'}
              `}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${actualizando ? 'animate-spin' : ''}`} />
              {actualizando ? 'Actualizando...' : 'Actualizar ahora'}
            </button>
          </div>
        </div>
        
        {/* Estado de carga */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Cargando información de guías...</p>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-white rounded-lg overflow-hidden shadow-md border border-red-200">
            <div className="p-4 border-b border-red-100">
              <h3 className="text-red-600 font-medium text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Error de conexión
              </h3>
              <p className="text-gray-600 mt-1">{error}</p>
            </div>
            <div className="p-4 bg-gray-50">
              <button 
                onClick={obtenerEstadosGuias}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar conexión
              </button>
            </div>
          </div>
        )}

        {/* Tabla de guías */}
        {!loading && !error && guias.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Listado de Guías</h2>
              <p className="text-sm text-gray-500">Información detallada de guías disponibles</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cédula
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guias.map((guia) => (
                    <tr key={guia._id || guia.id || `guia-${Math.random()}`} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold overflow-hidden">
                            {guia.foto ? (
                              <img 
                                src={guia.foto.startsWith('http') ? guia.foto : `http://localhost:10101/uploads/images/${guia.foto}`} 
                                alt={construirNombreCompleto(guia)}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${guia.primerNombre || guia.nombre || 'G'}+${guia.primerApellido || ''}&background=0D8ABC&color=fff&size=128`;
                                }}
                              />
                            ) : (
                              <>
                                {(guia.primerNombre || guia.nombre || 'G').charAt(0)}
                                {(guia.primerApellido || '').charAt(0)}
                              </>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {construirNombreCompleto(guia)}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              {guia.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guia.cedula || guia.documento || 'No registrada'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          guia.estado === 'activo' || guia.estado === 'disponible' 
                            ? 'bg-green-100 text-green-800'
                            : guia.estado === 'inactivo' 
                              ? 'bg-red-100 text-red-800'
                              : guia.estado === 'ocupado' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {guia.estado || 'Desconocido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => verDetalles(guia)} 
                            className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-100 transition-colors duration-200"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Última actualización: {ultimaActualizacion.toLocaleTimeString()}</span>
              </div>
              <div className="text-sm text-gray-500">{guias.length} guías encontrados</div>
            </div>
          </div>
        )}

        {/* Estado sin guías */}
        {!loading && !error && guias.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-200 flex items-center justify-center rounded-full mb-4">
              <Users className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay guías disponibles</h3>
            <p className="text-gray-500 mb-4">No se encontraron guías registrados en el sistema.</p>
            <button 
              onClick={obtenerEstadosGuias}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar listado
            </button>
          </div>
        )}
      </div>

      {/* Modal de detalles del guía */}
      {guiaSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
            <div className="px-6 py-4 bg-emerald-700 flex justify-between items-center border-b border-emerald-600 rounded-t-lg">
              <h3 className="text-lg font-medium text-white">Detalles del Guía</h3>
              <button 
                onClick={cerrarModal}
                className="text-white hover:text-gray-200 bg-emerald-800 hover:bg-emerald-900 rounded-full p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                  {guiaSeleccionado.foto ? (
                    <img 
                      src={guiaSeleccionado.foto.startsWith('http') ? guiaSeleccionado.foto : `http://localhost:10101/uploads/images/${guiaSeleccionado.foto}`} 
                      alt={construirNombreCompleto(guiaSeleccionado)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${guiaSeleccionado.primerNombre || guiaSeleccionado.nombre || 'G'}+${guiaSeleccionado.primerApellido || ''}&background=0D8ABC&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <>
                      {(guiaSeleccionado.primerNombre || guiaSeleccionado.nombre || 'G').charAt(0)}
                      {(guiaSeleccionado.primerApellido || '').charAt(0)}
                    </>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {construirNombreCompleto(guiaSeleccionado)}
                  </h4>
                  <p className="text-gray-500">{guiaSeleccionado.email || ''}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-t border-b border-gray-200 py-3">
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Información Personal</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Cédula</p>
                      <p className="text-sm font-medium">{guiaSeleccionado.cedula || guiaSeleccionado.documento || 'No registrada'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Estado</p>
                      <p className={`text-sm font-medium ${
                        guiaSeleccionado.estado === 'activo' || guiaSeleccionado.estado === 'disponible' 
                          ? 'text-emerald-600'
                          : guiaSeleccionado.estado === 'inactivo' 
                            ? 'text-red-600'
                            : guiaSeleccionado.estado === 'ocupado' 
                              ? 'text-amber-600'
                              : 'text-gray-600'
                      }`}>
                        {guiaSeleccionado.estado || 'Desconocido'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 py-3">
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Estadísticas</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Recorridos</p>
                      <p className="text-lg font-medium text-gray-900">{guiaSeleccionado.recorridos || '0'}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Calificación</p>
                      <p className="text-lg font-medium text-amber-600">{guiaSeleccionado.calificacion || '5.0'}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Experiencia</p>
                      <p className="text-lg font-medium text-teal-600">{guiaSeleccionado.experiencia || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </DashboardLayout>
  );
};

export default Products;