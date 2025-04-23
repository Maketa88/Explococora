import { useEffect, useState } from 'react';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import axios from 'axios';
import { Users, UserCheck, UserMinus, RefreshCw, Clock, Eye } from 'lucide-react';

const EstadoOperador = () => {
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [operadorSeleccionado, setOperadorSeleccionado] = useState(null);
  
  // Estado para los contadores
  const [contadores, setContadores] = useState({
    disponibles: 0,
    ocupados: 0,
    inactivos: 0,
    total: 0
  });
  
  // Configuración para el servidor
  const API_URL = 'https://servicio-explococora.onrender.com';
  const API_PATH = '/usuarios/listar-por-rol/operador';
  const API_CONTADOR_PATH = '/usuarios/contar-por-estado';

  // Función para construir nombre completo
  const construirNombreCompleto = (operadorData) => {
    if (!operadorData) return "Operador";
    
    // Intentar obtener el nombre de todas las posibles propiedades
    const primerNombre = operadorData.primerNombre || operadorData.nombre || operadorData.name || "";
    const segundoNombre = operadorData.segundoNombre || "";
    const primerApellido = operadorData.primerApellido || operadorData.apellido || operadorData.lastName || "";
    const segundoApellido = operadorData.segundoApellido || "";
    
    // Si tenemos un nombre completo ya formateado, usarlo
    if (operadorData.nombreCompleto) return operadorData.nombreCompleto;
    
    // Si tenemos un valor en nombre que ya podría ser el nombre completo
    if (operadorData.nombre && operadorData.nombre.includes(" ") && !primerApellido) {
      return operadorData.nombre;
    }
    
    // Construir el nombre completo con los componentes individuales
    const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.replace(/\s+/g, ' ').trim();
    
    // Si después de todo no tenemos un nombre, mostrar "Operador"
    return nombreCompleto || "Operador";
  };

  // Función para obtener contadores de estados
  const obtenerContadores = async (forzarActualizacion = false) => {
    try {
      // Verificar última actualización en localStorage
      const ultimaActualizacionContadoresGuardada = localStorage.getItem('ultimaActualizacionContadoresOperadoresAdmin');
      const ahora = new Date().getTime();
      
      // Si no es una actualización forzada, verificar si debemos actualizar
      if (!forzarActualizacion && ultimaActualizacionContadoresGuardada) {
        const tiempoTranscurrido = ahora - parseInt(ultimaActualizacionContadoresGuardada);
        
        // Si han pasado menos de 60 segundos desde la última actualización
        if (tiempoTranscurrido < 60000) {
          // Cargar contadores del localStorage si existen
          const contadoresGuardados = localStorage.getItem('contadoresOperadoresAdmin');
          
          if (contadoresGuardados) {
            setContadores(JSON.parse(contadoresGuardados));
            return;
          }
        }
      }
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_URL}${API_CONTADOR_PATH}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data && response.data.data.operadores) {
        const operadoresData = response.data.data.operadores;
        
        // Inicializar contadores en 0
        const nuevoConteo = {
          disponibles: 0,
          ocupados: 0,
          inactivos: 0,
          total: 0
        };
        
        // Actualizar contadores según los datos recibidos
        operadoresData.forEach(item => {
          if (item.estado === 'disponible') nuevoConteo.disponibles = item.cantidad;
          if (item.estado === 'ocupado') nuevoConteo.ocupados = item.cantidad;
          if (item.estado === 'inactivo') nuevoConteo.inactivos = item.cantidad;
        });
        
        // Calcular total
        nuevoConteo.total = nuevoConteo.disponibles + nuevoConteo.ocupados + nuevoConteo.inactivos;
        
        // Guardar en localStorage
        localStorage.setItem('ultimaActualizacionContadoresOperadoresAdmin', ahora.toString());
        localStorage.setItem('contadoresOperadoresAdmin', JSON.stringify(nuevoConteo));
        
        setContadores(nuevoConteo);
      }
    } catch (err) {
      console.error("Error al obtener contadores:", err);
    }
  };

  const obtenerEstadosOperadores = async (forzarActualizacion = false) => {
    try {
      // Verificar última actualización en localStorage
      const ultimaActualizacionGuardada = localStorage.getItem('ultimaActualizacionOperadoresAdmin');
      const ahora = new Date().getTime();
      
      // Si no es una actualización forzada, verificar si debemos actualizar
      if (!forzarActualizacion && ultimaActualizacionGuardada) {
        const tiempoTranscurrido = ahora - parseInt(ultimaActualizacionGuardada);
        
        // Si han pasado menos de 60 segundos desde la última actualización
        if (tiempoTranscurrido < 60000) {
          console.log(`Usando datos en caché. Próxima actualización en ${Math.floor((60000 - tiempoTranscurrido) / 1000)} segundos`);
          
          // Cargar datos del localStorage si existen
          const operadoresGuardados = localStorage.getItem('operadoresDataAdmin');
          
          if (operadoresGuardados) {
            setOperadores(JSON.parse(operadoresGuardados));
            setLoading(false);
            setUltimaActualizacion(new Date(parseInt(ultimaActualizacionGuardada)));
            
            // También cargar contadores guardados
            const contadoresGuardados = localStorage.getItem('contadoresOperadoresAdmin');
            if (contadoresGuardados) {
              setContadores(JSON.parse(contadoresGuardados));
            }
            return;
          }
        }
      }
      
      setActualizando(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
        setLoading(false);
        setActualizando(false);
        return;
      }
      
      // URL para obtener operadores
      const urlCompleta = `${API_URL}${API_PATH}`;
      console.log('Intentando conectar a:', urlCompleta);
      
      const response = await axios.get(urlCompleta, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      let operadoresData = [];
      
      if (response.data && response.data.usuarios) {
        operadoresData = response.data.usuarios;
      } else if (response.data && Array.isArray(response.data)) {
        operadoresData = response.data;
      } else if (response.data && (response.data.operadores || response.data.data)) {
        operadoresData = response.data.operadores || response.data.data;
      } else {
        setError('La respuesta del servidor no tiene el formato esperado');
        setOperadores([]);
        setLoading(false);
        setActualizando(false);
        return;
      }
      
      // Intentar obtener más información de cada operador
      const operadoresPromises = operadoresData.map(async (operador) => {
        try {
          // Intentar obtener el perfil completo si tenemos cédula o id
          if (operador.cedula || operador.documento || operador._id || operador.id) {
            const cedulaOId = operador.cedula || operador.documento || operador._id || operador.id;
            
            try {
              const perfilResponse = await axios.get(`${API_URL}/operador-turistico/perfil-completo/${cedulaOId}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (perfilResponse.data && (perfilResponse.data.data || perfilResponse.data)) {
                const perfilData = perfilResponse.data.data || perfilResponse.data;
                return {...operador, ...perfilData};
              }
            } catch (error) {
              // Si falla, continuamos con la información básica
              console.log("No se pudo obtener perfil detallado:", error.message);
            }
          }
          
          return operador;
        } catch {
          // En caso de error, devolvemos la información básica
          return operador;
        }
      });
      
      const operadoresActualizados = await Promise.all(operadoresPromises);
      
      // Guardar en localStorage la marca de tiempo actual y los datos
      localStorage.setItem('ultimaActualizacionOperadoresAdmin', ahora.toString());
      localStorage.setItem('operadoresDataAdmin', JSON.stringify(operadoresActualizados));
      
      // Actualizar contadores
      const disponibles = operadoresActualizados.filter(op => op.estado === 'disponible' || op.estado === 'activo').length;
      const ocupados = operadoresActualizados.filter(op => op.estado === 'ocupado').length;
      const inactivos = operadoresActualizados.filter(op => op.estado === 'inactivo').length;
      const total = operadoresActualizados.length;
      
      const nuevosContadores = {
        disponibles,
        ocupados,
        inactivos,
        total
      };
      
      // Guardar contadores en localStorage
      localStorage.setItem('contadoresOperadoresAdmin', JSON.stringify(nuevosContadores));
      
      // Actualizar estados
      setOperadores(operadoresActualizados);
      setContadores(nuevosContadores);
      setUltimaActualizacion(new Date());
      setLoading(false);
      setActualizando(false);
      
      return operadoresActualizados;
    } catch (err) {
      console.error('Error al obtener operadores:', err);
      
      let mensajeError = 'Error al conectar con el servidor';
      
      if (err.response) {
        mensajeError = `Error del servidor: ${err.response.status}`;
        if (err.response.data && err.response.data.message) {
          mensajeError = err.response.data.message;
        }
      } else if (err.request) {
        mensajeError = 'No se recibió respuesta del servidor';
      } else {
        mensajeError = err.message || 'Error desconocido al conectar con el servidor';
      }
      
      setError(mensajeError);
      setOperadores([]);
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    // Al montar el componente, inicializamos los contadores desde localStorage
    const contadoresGuardados = localStorage.getItem('contadoresOperadoresAdmin');
    if (contadoresGuardados) {
      setContadores(JSON.parse(contadoresGuardados));
    }
    
    // Luego cargamos los datos completos
    obtenerEstadosOperadores(false);
    
    // Configurar intervalo para actualizar cada minuto
    const intervalo = setInterval(() => {
      obtenerEstadosOperadores(true); // Forzar actualización al cumplirse el intervalo
    }, 60000);
    
    return () => clearInterval(intervalo);
  }, []);

  // Función para abrir el modal de detalles
  const verDetalles = (operador) => {
    setOperadorSeleccionado(operador);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setOperadorSeleccionado(null);
  };

  // Función para actualizar manualmente (botón "Actualizar ahora")
  const actualizarManualmente = () => {
    obtenerEstadosOperadores(true); // Forzar actualización
  };

  // Añadir esta función de normalización al inicio del componente
  const normalizarEstadoTexto = (estado) => {
    if (estado === 1 || estado === '1') return 'disponible';
    if (estado === 2 || estado === '2') return 'ocupado';
    if (estado === 0 || estado === '0') return 'inactivo';
    
    // Si ya es un string válido, devolverlo
    if (['disponible', 'ocupado', 'inactivo'].includes(estado)) return estado;
    
    // Valor por defecto
    return 'disponible';
  };

  return (
    <DashboardLayoutAdmin>
      <div className="flex flex-col gap-6 transition-all duration-300 transform">
        {/* Panel superior con estadísticas */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-600">
            <h1 className="text-2xl font-bold text-white">Estado de Operadores</h1>
            <p className="text-blue-100 text-sm">Monitoreo y control de disponibilidad</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4">
            {/* Total de Operadores */}
            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total</p>
                  <h2 className="text-3xl font-bold text-gray-800 mt-1">{contadores.total}</h2>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
            
            {/* Operadores Disponibles */}
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
            
            {/* Operadores Ocupados */}
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
            
            {/* Operadores Inactivos */}
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
              <span>Actualización automática cada 1m</span>
            </div>
            <button 
              onClick={actualizarManualmente}
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
            <p className="text-gray-600">Cargando información de operadores...</p>
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
                onClick={actualizarManualmente}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar conexión
              </button>
            </div>
          </div>
        )}

        {/* Tabla de operadores */}
        {!loading && !error && operadores.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Listado de Operadores</h2>
              <p className="text-sm text-gray-500">Información detallada de operadores disponibles</p>
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
                  {operadores.map((operador) => (
                    <tr key={operador._id || operador.id || `operador-${Math.random()}`} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
                            {operador.foto ? (
                              <img 
                                src={operador.foto.startsWith('http') ? operador.foto : `https://servicio-explococora.onrender.com/uploads/images/${operador.foto}`} 
                                alt={construirNombreCompleto(operador)}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${operador.primerNombre || operador.nombre || 'O'}+${operador.primerApellido || ''}&background=0D8ABC&color=fff&size=128`;
                                }}
                              />
                            ) : (
                              <>
                                {(operador.primerNombre || operador.nombre || 'O').charAt(0)}
                                {(operador.primerApellido || '').charAt(0)}
                              </>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {construirNombreCompleto(operador)}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              {operador.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {operador.cedula || operador.documento || 'No registrada'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          normalizarEstadoTexto(operador.estado) === 'disponible' 
                            ? 'bg-green-100 text-green-800'
                            : normalizarEstadoTexto(operador.estado) === 'inactivo' 
                              ? 'bg-red-100 text-red-800'
                              : normalizarEstadoTexto(operador.estado) === 'ocupado' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {normalizarEstadoTexto(operador.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => verDetalles(operador)} 
                            className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
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
              <div className="text-sm text-gray-500">{operadores.length} operadores encontrados</div>
            </div>
          </div>
        )}

        {/* Estado sin operadores */}
        {!loading && !error && operadores.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-200 flex items-center justify-center rounded-full mb-4">
              <Users className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay operadores disponibles</h3>
            <p className="text-gray-500 mb-4">No se encontraron operadores registrados en el sistema.</p>
            <button 
              onClick={actualizarManualmente}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar listado
            </button>
          </div>
        )}
      </div>

      {/* Modal de detalles del operador */}
      {operadorSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
            <div className="px-6 py-4 bg-emerald-700 flex justify-between items-center border-b border-emerald-600 rounded-t-lg">
              <h3 className="text-lg font-medium text-white">Detalles del Operador</h3>
              <button 
                onClick={cerrarModal}
                className="text-white hover:text-gray-200 bg-emerald-800 hover:bg-emerald-900 rounded-full p-1.5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                  {operadorSeleccionado.foto ? (
                    <img 
                      src={operadorSeleccionado.foto.startsWith('http') ? operadorSeleccionado.foto : `https://servicio-explococora.onrender.com/uploads/images/${operadorSeleccionado.foto}`} 
                      alt={construirNombreCompleto(operadorSeleccionado)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${operadorSeleccionado.primerNombre || operadorSeleccionado.nombre || 'O'}+${operadorSeleccionado.primerApellido || ''}&background=0D8ABC&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <>
                      {(operadorSeleccionado.primerNombre || operadorSeleccionado.nombre || 'O').charAt(0)}
                      {(operadorSeleccionado.primerApellido || '').charAt(0)}
                    </>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {construirNombreCompleto(operadorSeleccionado)}
                  </h4>
                  <p className="text-gray-500">{operadorSeleccionado.email || ''}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-t border-b border-gray-200 py-3">
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Información Personal</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Cédula</p>
                      <p className="text-sm font-medium">{operadorSeleccionado.cedula || operadorSeleccionado.documento || 'No registrada'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Estado</p>
                      <p className={`text-sm font-medium ${
                        operadorSeleccionado.estado === 'activo' || operadorSeleccionado.estado === 'disponible' 
                          ? 'text-blue-600'
                          : operadorSeleccionado.estado === 'inactivo' 
                            ? 'text-red-600'
                            : operadorSeleccionado.estado === 'ocupado' 
                              ? 'text-amber-600'
                              : 'text-gray-600'
                      }`}>
                        {operadorSeleccionado.estado || 'Desconocido'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 py-3">
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Estadísticas</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Reservas</p>
                      <p className="text-lg font-medium text-gray-900">{operadorSeleccionado.reservas || '0'}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Calificación</p>
                      <p className="text-lg font-medium text-amber-600">{operadorSeleccionado.calificacion || '5.0'}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Experiencia</p>
                      <p className="text-lg font-medium text-emerald-600">{operadorSeleccionado.experiencia || 'N/A'}</p>
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
    </DashboardLayoutAdmin>
  );
};

export default EstadoOperador;
