import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, Search, Filter, RefreshCw, UserPlus, Award, Star, Briefcase, Globe, Languages, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SelectorEstado from '../CambioEstadoOpe/Selector_Estado_Ope';
import logoExplococora from '../../../assets/Images/logo.webp';

const Guias = () => {
  const navigate = useNavigate();
  const [guias, setGuias] = useState([]);
  const [guiasCompletos, setGuiasCompletos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, disponible, ocupado, inactivo
  const [ordenarPor, setOrdenarPor] = useState('nombre'); // nombre, fecha, experiencia
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Función para redirigir a la página de nuevo guía
  const handleAddGuia = () => {
    navigate('/VistaOperador/nuevo-guia');
  };

  // Función para construir nombre completo
  const construirNombreCompleto = (guiaData) => {
    if (!guiaData) return "Guía";
    
    const primerNombre = guiaData.primerNombre || "";
    const segundoNombre = guiaData.segundoNombre || "";
    const primerApellido = guiaData.primerApellido || "";
    const segundoApellido = guiaData.segundoApellido || "";
    
    return `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
  };

  // Nueva función para obtener el estado del operador
  const obtenerEstadoOperador = async (cedula) => {
    if (!cedula) return 'disponible';
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:10101/usuarios/consultar-estado/${cedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data?.data?.estado || 'disponible';
    } catch (error) {
      console.error(`Error al obtener estado del operador ${cedula}:`, error);
      return 'disponible';
    }
  };

  useEffect(() => {
    const fetchGuias = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error("No hay token de autenticación");
          setError("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
          setLoading(false);
          return;
        }
        
        console.log("Intentando obtener guías con token:", token.substring(0, 10) + "...");
        
        // Lista de posibles endpoints para probar
        const endpoints = [
          'http://localhost:10101/guia/todos',
          'http://localhost:10101/guias/todos',
          'http://localhost:10101/operador-turistico/guias'
        ];
        
        let guiasData = [];
        let successEndpoint = '';
        
        // Probar cada endpoint hasta encontrar uno que funcione
        for (const endpoint of endpoints) {
          try {
            console.log(`Intentando endpoint: ${endpoint}`);
            const response = await axios.get(endpoint, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.data) {
              if (Array.isArray(response.data)) {
                guiasData = response.data;
              } else if (response.data && typeof response.data === 'object') {
                guiasData = response.data.guias || response.data.data || response.data.results || [];
                
                if (!Array.isArray(guiasData) && typeof guiasData === 'object') {
                  guiasData = [guiasData];
                }
              }
              
              successEndpoint = endpoint;
              console.log(`Éxito con endpoint: ${endpoint}`);
              break; // Salir del bucle si encontramos un endpoint que funciona
            }
          } catch (err) {
            console.warn(`Error con endpoint ${endpoint}:`, err.message);
          }
        }
        
        if (guiasData.length === 0) {
          // Si no pudimos obtener datos, usar datos de ejemplo para desarrollo
          console.warn("No se pudo obtener datos de guías reales, usando datos de ejemplo");
          guiasData = [
            {
              id: 1,
              primerNombre: "Carlos",
              segundoNombre: "Alberto",
              primerApellido: "Rodríguez",
              segundoApellido: "Gómez",
              cedula: "1234567890",
              email: "carlos@example.com",
              telefono: "3001234567",
              numeroCelular: "3001234567",
              fecha_registro: "2023-01-15",
              verificado: true,
              experiencia: 5,
              idiomas: "Español, Inglés",
              ubicacion: "Armenia, Quindío"
            },
            {
              id: 2,
              primerNombre: "Ana",
              segundoNombre: "María",
              primerApellido: "López",
              segundoApellido: "Pérez",
              cedula: "0987654321",
              email: "ana@example.com",
              telefono: "3009876543",
              numeroCelular: "3009876543",
              fecha_registro: "2023-02-20",
              verificado: false,
              experiencia: 3,
              idiomas: "Español",
              ubicacion: "Salento, Quindío"
            }
          ];
        }
        
        setGuias(guiasData);
        
        // Obtener datos completos para cada guía si es posible
        const guiasCompletosPromises = guiasData.map(async (guia) => {
          if (guia.cedula) {
            try {
              // Intentar obtener datos completos del guía
              const perfilResponse = await axios.get(`http://localhost:10101/guia/perfil-completo/${guia.cedula}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              // Obtener el estado actual del operador
              const estado = await obtenerEstadoOperador(guia.cedula);
              
              let datosPerfil = null;
              
              if (perfilResponse.data) {
                if (Array.isArray(perfilResponse.data)) {
                  if (perfilResponse.data.length > 0) {
                    if (Array.isArray(perfilResponse.data[0])) {
                      if (perfilResponse.data[0].length > 0) {
                        datosPerfil = perfilResponse.data[0][0];
                      }
                    } else {
                      datosPerfil = perfilResponse.data[0];
                    }
                  }
                } else if (typeof perfilResponse.data === 'object') {
                  datosPerfil = perfilResponse.data;
                }
              }
              
              if (datosPerfil) {
                // Combinar los datos originales con los datos de perfil completo
                return {
                  ...guia,
                  ...datosPerfil,
                  estado: estado,
                  telefono: datosPerfil.telefono || datosPerfil.numeroCelular || datosPerfil.numero_celular || guia.telefono || guia.numeroCelular || guia.numero_celular || "No disponible"
                };
              }
            } catch (perfilError) {
              console.warn(`No se pudo obtener perfil completo para ${guia.cedula}:`, perfilError.message);
            }
          }
          
          return { ...guia, estado: estado };
        });
        
        const guiasCompletosData = await Promise.all(guiasCompletosPromises);
        setGuiasCompletos(guiasCompletosData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener guías:", error);
        setError(`Error al cargar guías: ${error.message}`);
        setLoading(false);
      }
    };

    fetchGuias();
  }, []);

  // Implementación del buscador y filtros
  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda se aplica instantáneamente
  };

  // Función para manejar el cambio de estado de un guía
  const handleCambioEstado = (cedula, nuevoEstado) => {
    setGuiasCompletos(prevGuias => 
      prevGuias.map(guia => 
        guia.cedula === cedula ? { ...guia, estado: nuevoEstado } : guia
      )
    );
  };

  const guiasFiltrados = () => {
    let resultado = [...guiasCompletos];
    
    // Aplicar filtro por estado del operador
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(guia => guia.estado === filtroEstado);
    }
    
    // Aplicar búsqueda por término
    if (searchTerm.trim() !== '') {
      const termino = searchTerm.toLowerCase();
      resultado = resultado.filter(guia => {
        // Crear nombre completo para búsqueda
        const nombreCompleto = construirNombreCompleto(guia).toLowerCase();
        
        return nombreCompleto.includes(termino) || 
               (guia.cedula && guia.cedula.toLowerCase().includes(termino)) ||
               (guia.email && guia.email.toLowerCase().includes(termino)) ||
               (guia.ubicacion && guia.ubicacion.toLowerCase().includes(termino));
      });
    }
    
    // Aplicar ordenamiento
    resultado.sort((a, b) => {
      if (ordenarPor === 'nombre') {
        const nombreA = construirNombreCompleto(a).toLowerCase();
        const nombreB = construirNombreCompleto(b).toLowerCase();
        return nombreA.localeCompare(nombreB);
      } else if (ordenarPor === 'fecha') {
        const fechaA = new Date(a.fecha_registro || 0);
        const fechaB = new Date(b.fecha_registro || 0);
        return fechaB - fechaA; // Más reciente primero
      }
      return 0;
    });
    
    return resultado;
  };

  return (
    <DashboardLayout>
      <div className={`p-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Gestión de Guías</h1>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex">
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-4 py-2 rounded-l-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'} min-w-[400px]`}
              />
              <button 
                onClick={handleSearch}
                className={`px-3 py-2 rounded-r-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`px-3 py-2 rounded-md flex items-center ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
            >
              <Filter className="w-5 h-5 mr-1.5" />
              Filtros
            </button>
            
            <button
              onClick={handleAddGuia}
              className={`px-3 py-2 rounded-md flex items-center ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              <UserPlus className="w-5 h-5 mr-1.5" />
              Nuevo guía
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className={`px-3 py-2 rounded-md flex items-center ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white`}
            >
              <RefreshCw className="w-5 h-5 mr-1.5" />
              Actualizar
            </button>
          </div>
        </div>
        
        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Estado</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFiltroEstado('todos')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'todos' 
                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstado('disponible')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'disponible' 
                        ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Disponible
                  </button>
                  <button
                    onClick={() => setFiltroEstado('ocupado')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'ocupado' 
                        ? (darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Ocupado
                  </button>
                  <button
                    onClick={() => setFiltroEstado('inactivo')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'inactivo' 
                        ? (darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Inactivo
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Ordenar por</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrdenarPor('nombre')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      ordenarPor === 'nombre' 
                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Nombre
                  </button>
                  <button
                    onClick={() => setOrdenarPor('fecha')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      ordenarPor === 'fecha' 
                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800')
                    }`}
                  >
                    Más recientes
                  </button>
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFiltroEstado('todos');
                    setOrdenarPor('nombre');
                  }}
                  className={`px-3 py-1 text-sm rounded-md ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                  }`}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Total de Guías</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-700'}`}>
                {guiasCompletos.length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
              <UserPlus className={`w-6 h-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900' : 'bg-green-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Guías Disponibles</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-green-700'}`}>
                {guiasCompletos.filter(g => g.estado === 'disponible').length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-green-800' : 'bg-green-100'}`}>
              <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>Guías Ocupados</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-yellow-700'}`}>
                {guiasCompletos.filter(g => g.estado === 'ocupado').length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-yellow-800' : 'bg-yellow-100'}`}>
              <Briefcase className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`} />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900' : 'bg-red-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>Guías Inactivos</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-red-700'}`}>
                {guiasCompletos.filter(g => g.estado === 'inactivo').length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-red-800' : 'bg-red-100'}`}>
              <XCircle className={`w-6 h-6 ${darkMode ? 'text-red-300' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        {/* Lista de guías */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}>
            <p className="text-lg font-medium mb-2">Error al cargar guías</p>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guiasFiltrados().length > 0 ? (
              guiasFiltrados().map((guia) => (
                <div 
                  key={guia.id || guia.cedula} 
                  className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} relative`}
                >
                  {/* Cabecera con imagen */}
                  <div 
                    className="h-36 relative bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${logoExplococora})`,
                      backgroundSize: '200px',
                      backgroundPosition: 'center',
                      backgroundColor: darkMode ? '#1e3a8a' : '#3b82f6',
                      backgroundBlendMode: 'soft-light',
                      opacity: '0.9'
                    }}
                  >
                    <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
                      <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-blue-200 shadow-lg">
                        {guia.foto ? (
                          <img 
                            src={guia.foto.startsWith('http') ? guia.foto : `http://localhost:10101/uploads/images/${guia.foto}`} 
                            alt={construirNombreCompleto(guia)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${guia.primerNombre}+${guia.primerApellido}&background=0D8ABC&color=fff&size=128`;
                            }}
                          />
                        ) : (
                          <img 
                            src={`https://ui-avatars.com/api/?name=${guia.primerNombre}+${guia.primerApellido}&background=0D8ABC&color=fff&size=128`} 
                            alt={construirNombreCompleto(guia)}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Estado del guía en la esquina */}
                    <div className="absolute top-2 right-2">
                      <SelectorEstado
                        estadoActual={guia.estado || 'disponible'}
                        onCambioEstado={(nuevoEstado) => handleCambioEstado(guia.cedula, nuevoEstado)}
                        id={guia.id}
                        esAdmin={false}
                        esPropio={true}
                      />
                    </div>
                  </div>
                  
                  {/* Información del guía */}
                  <div className="pt-16 px-6 pb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold flex items-center justify-center">
                        {construirNombreCompleto(guia)}
                        {guia.calificacion && (
                          <div className="ml-2 flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm ml-1">{guia.calificacion}</span>
                          </div>
                        )}
                      </h3>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {guia.especialidad || 'Guía Turístico General'}
                      </p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="text-sm truncate">{guia.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-3 text-green-500" />
                        <span className="text-sm">{guia.telefono || guia.numeroCelular || guia.numero_celular || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-3 text-red-500" />
                        <span className="text-sm">{guia.ubicacion || 'No especificada'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="text-sm">Desde {new Date(guia.fecha_registro || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-3 text-purple-500" />
                        <span className="text-sm">{guia.cedula || 'No disponible'}</span>
                      </div>
                    </div>
                    
                    {/* Botón de acción */}
                    <div className="flex justify-center">
                      <button 
                        onClick={() => navigate(`/VistaOperador/guias/${guia.cedula}`)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium w-full max-w-[200px]"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`col-span-3 text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="flex flex-col items-center">
                  <XCircle className="w-16 h-16 mb-4 opacity-30" />
                  <h3 className="text-xl font-semibold mb-2">No se encontraron guías</h3>
                  <p className="mb-6">No hay guías que coincidan con los criterios de búsqueda.</p>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setFiltroEstado('todos');
                      }}
                      className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                    >
                      Limpiar filtros
                    </button>
                    <button 
                      onClick={handleAddGuia}
                      className={`px-4 py-2 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      Añadir nuevo guía
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Guias; 