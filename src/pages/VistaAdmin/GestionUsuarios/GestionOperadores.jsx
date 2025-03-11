import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import { Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, Search, Filter, RefreshCw, UserPlus, Award, Star, Briefcase, Globe, Languages, CreditCard, Trash2, Edit, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoExplococora from '../../../assets/Images/logo.webp';
import { toast } from 'react-toastify';
import EliminarOperador from './EliminarOperador';
import CrearOperador from './CrearOperador';
import EditarOperador from './EditarOperador';
import EstadoOperador from '../../../components/Operadores/EstadoOperador';

const Operadores = () => {
  const navigate = useNavigate();
  const [operadores, setOperadores] = useState([]);
  const [operadoresCompletos, setOperadoresCompletos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, disponible, ocupado, inactivo
  const [ordenarPor, setOrdenarPor] = useState('nombre'); // nombre, fecha, experiencia
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  // Estados para modales
  const [showCrearOperadorModal, setShowCrearOperadorModal] = useState(false);
  const [showEliminarOperadorModal, setShowEliminarOperadorModal] = useState(false);
  const [showEditarOperadorModal, setShowEditarOperadorModal] = useState(false);
  const [operadorSeleccionado, setOperadorSeleccionado] = useState(null);
  const [operadorParaEditar, setOperadorParaEditar] = useState(null);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [operadorDetalle, setOperadorDetalle] = useState(null);
  const [showImagenModal, setShowImagenModal] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  // Función para abrir modal de crear operador
  const handleOpenCrearOperadorModal = () => {
    setShowCrearOperadorModal(true);
  };

  // Función para abrir modal de eliminar operador
  const handleOpenEliminarOperadorModal = (operador) => {
    setOperadorSeleccionado(operador);
    setShowEliminarOperadorModal(true);
  };

  // Función para abrir modal de editar operador
  const handleOpenEditarOperadorModal = (operador) => {
    console.log("Abriendo modal de edición para operador:", operador);
    setOperadorParaEditar(operador);
    setShowEditarOperadorModal(true);
  };

  // Función para abrir modal de detalles
  const handleOpenDetallesModal = (operador) => {
    setOperadorDetalle(operador);
    setShowDetallesModal(true);
  };

  // Función para mostrar imagen ampliada
  const handleMostrarImagenAmpliada = (imagenUrl) => {
    setImagenAmpliada(imagenUrl);
    setShowImagenModal(true);
  };

  // Función para manejar la creación exitosa de un operador
  const handleOperadorCreated = (nuevoOperador) => {
    // Actualizar la lista de operadores
    setOperadoresCompletos(prevOperadores => [
      { ...nuevoOperador, estado: 'disponible' }, 
      ...prevOperadores
    ]);
    toast.success("Operador creado correctamente");
  };

  // Función para manejar la eliminación exitosa de un operador
  const handleOperadorDeleted = (cedulaOperadorEliminado) => {
    // Actualizar la lista de operadores eliminando el que se borró
    setOperadoresCompletos(prevOperadores => 
      prevOperadores.filter(operador => operador.cedula !== cedulaOperadorEliminado)
    );
    toast.success("Operador eliminado correctamente");
  };

  // Función para manejar la actualización exitosa de un operador
  const handleOperadorUpdated = (operadorActualizado) => {
    console.log("Operador actualizado:", operadorActualizado);
    // Actualizar la lista de operadores
    setOperadoresCompletos(prevOperadores => 
      prevOperadores.map(operador => 
        operador.cedula === operadorActualizado.cedula ? operadorActualizado : operador
      )
    );
    toast.success("Información del operador actualizada correctamente");
  };

  // Función para redirigir a la página de nuevo operador (ahora usamos el modal en su lugar)
  const handleAddOperador = () => {
    handleOpenCrearOperadorModal();
  };

  // Función para construir nombre completo
  const construirNombreCompleto = (operadorData) => {
    if (!operadorData) return "Operador";
    
    const primerNombre = operadorData.primerNombre || "";
    const segundoNombre = operadorData.segundoNombre || "";
    const primerApellido = operadorData.primerApellido || "";
    const segundoApellido = operadorData.segundoApellido || "";
    
    return `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
  };

  // Nueva función para obtener el estado del operador
  const obtenerEstadoOperador = async (cedula) => {
    if (!cedula) return 'disponible';
    
    try {
      const token = localStorage.getItem('token');
      
      // Intentar obtener el estado silenciosamente - sin mostrar errores en consola
      const response = await axios.get(`http://localhost:10101/usuarios/consultar-estado/cedula/${cedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // Configurar para que axios no lance error en caso de respuesta 404
        validateStatus: function (status) {
          return status < 500; // Resolver promesa solo para códigos de estado no severos
        }
      });
      
      // Si la respuesta es exitosa, devolver el estado
      if (response.status === 200 && response.data?.data?.estado) {
        return response.data.data.estado;
      }
      
      // Si no se encontró el estado, devolver disponible sin generar error
      return 'disponible';
    } catch (error) {
      // Evitar mostrar errores en consola
      return 'disponible';
    }
  };

  // Función para actualizar el estado de un operador
  const actualizarEstadoOperador = async (operador, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
        return;
      }

      // Llamada a la API para actualizar el estado
      const response = await axios.patch(
        `http://localhost:10101/usuarios/cambiar-estado/cedula/${operador.cedula}`,
        { 
          estado: nuevoEstado 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        // Actualizar el estado en el frontend
        const operadoresActualizados = operadoresCompletos.map(o => {
          if (o.cedula === operador.cedula) {
            return { ...o, estado: nuevoEstado };
          }
          return o;
        });
        
        setOperadoresCompletos(operadoresActualizados);
        toast.success(`Estado del operador actualizado a: ${nuevoEstado}`);
      } else {
        throw new Error(response.data?.message || "Error al actualizar estado");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error(error.response?.data?.message || "No se pudo actualizar el estado del operador");
    }
  };

  // Función para actualizar estados en tiempo real
  const actualizarEstados = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
        return;
      }
      
      const response = await axios.get('http://localhost:10101/usuarios/listar-estados', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        // Actualizar solo los estados manteniendo el resto de la información
        const nuevosEstados = response.data.data || [];
        
        setOperadoresCompletos(prevOperadores => {
          return prevOperadores.map(operador => {
            const estadoActualizado = nuevosEstados.find(
              e => e.cedula === operador.cedula || e.id === operador.id
            );
            
            if (estadoActualizado) {
              return {
                ...operador,
                estado: estadoActualizado.estado
              };
            }
            return operador;
          });
        });
        
        toast.success("Estados actualizados correctamente");
      } else {
        throw new Error(response.data?.message || "Error al actualizar estados");
      }
    } catch (error) {
      console.error("Error al actualizar estados:", error);
      toast.error(error.response?.data?.message || "No se pudieron actualizar los estados");
    }
  };

  // Añadir este efecto para escuchar cambios de estado
  useEffect(() => {
    // Función que actualiza los operadores cuando cambia el estado
    const handleEstadoCambiado = (event) => {
      if (!event.detail || !event.detail.cedula) return;
      
      // Actualizar el operador en la lista
      setOperadoresCompletos(prevOperadores => {
        const nuevosOperadores = prevOperadores.map(operador => {
          if (operador.cedula === event.detail.cedula) {
            return { ...operador, estado: event.detail.nuevoEstado };
          }
          return operador;
        });
        
        return nuevosOperadores;
      });
    };
    
    // Suscribirse al evento global de cambio de estado
    window.addEventListener('operadorEstadoCambiado', handleEstadoCambiado);
    
    // Configurar intervalo para actualizar estados cada 30 segundos
    const intervalId = setInterval(actualizarEstados, 30000);
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('operadorEstadoCambiado', handleEstadoCambiado);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const fetchOperadores = async () => {
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
        
        console.log("Intentando obtener operadores con token:", token.substring(0, 10) + "...");
        
        // Lista de posibles endpoints para probar
        const endpoints = [
          'http://localhost:10101/operador-turistico',
          'http://localhost:10101/operador-turistico',
        ];
        
        let operadoresData = [];
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
                operadoresData = response.data;
              } else if (response.data && typeof response.data === 'object') {
                operadoresData = response.data.operadores || response.data.data || response.data.results || [];
                
                if (!Array.isArray(operadoresData) && typeof operadoresData === 'object') {
                  operadoresData = [operadoresData];
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
        
        if (operadoresData.length === 0) {
          // Si no pudimos obtener datos, usar datos de ejemplo para desarrollo
          console.warn("No se pudo obtener datos de operadores reales, usando datos de ejemplo");
          operadoresData = [
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
        
        setOperadores(operadoresData);
        
        // Obtener datos completos para cada operador si es posible
        const operadoresCompletosPromises = operadoresData.map(async (operador) => {
          if (operador.cedula) {
            try {
              // Intentar obtener datos completos del operador
              const perfilResponse = await axios.get(`http://localhost:10101/operador-turistico/perfil-completo/${operador.cedula}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              // Obtener el estado actual del operador
              const estado = await obtenerEstadoOperador(operador.cedula);
              
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
                  ...operador,
                  ...datosPerfil,
                  estado: estado,
                  telefono: datosPerfil.telefono || datosPerfil.numeroCelular || datosPerfil.numero_celular || operador.telefono || operador.numeroCelular || operador.numero_celular || "No disponible"
                };
              }
            } catch (perfilError) {
              console.warn(`No se pudo obtener perfil completo para ${operador.cedula}:`, perfilError.message);
            }
          }
          
          // Si no se pudo obtener el perfil completo, usar los datos básicos
          const estado = await obtenerEstadoOperador(operador.cedula);
          return { ...operador, estado: estado };
        });
        
        const operadoresCompletosData = await Promise.all(operadoresCompletosPromises);
        setOperadoresCompletos(operadoresCompletosData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener operadores:", error);
        setError(`Error al cargar operadores: ${error.message}`);
        setLoading(false);
      }
    };

    fetchOperadores();
  }, []);

  // Implementación del buscador y filtros
  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda se aplica instantáneamente
  };

  const operadoresFiltrados = () => {
    let resultado = [...operadoresCompletos];
    
    // Aplicar filtro por estado del operador
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(operador => operador.estado === filtroEstado);
    }
    
    // Aplicar búsqueda por término
    if (searchTerm.trim() !== '') {
      const termino = searchTerm.toLowerCase();
      resultado = resultado.filter(operador => {
        // Crear nombre completo para búsqueda
        const nombreCompleto = construirNombreCompleto(operador).toLowerCase();
        
        return nombreCompleto.includes(termino) || 
               (operador.cedula && operador.cedula.toLowerCase().includes(termino)) ||
               (operador.email && operador.email.toLowerCase().includes(termino)) ||
               (operador.ubicacion && operador.ubicacion.toLowerCase().includes(termino));
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

  // Componente para botones de acción en tarjeta
  const BotonesAccion = ({ operador }) => {
    return (
      <div className="absolute top-2 left-2 flex space-x-2">
        {/* Botón para eliminar operador */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEliminarOperadorModal(operador);
          }}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
          title="Eliminar operador"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        
        {/* Botón para actualizar información */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEditarOperadorModal(operador);
          }}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
          title="Actualizar información"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Componente Modal para mostrar imagen ampliada
  const ImagenAmpliadaModal = ({ imagenUrl, onClose }) => {
    if (!imagenUrl) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="relative max-w-4xl max-h-[90vh]">
          <button 
            onClick={onClose}
            className="absolute -top-10 right-0 p-2 bg-white rounded-full text-black hover:bg-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={imagenUrl} 
            alt="Imagen ampliada" 
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=O&background=0D8ABC&color=fff&size=256`;
            }}
          />
        </div>
      </div>
    );
  };

  // Componente Modal para mostrar detalles del operador
  const DetallesOperadorModal = ({ operador, onClose }) => {
    if (!operador) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className={`relative w-full max-w-4xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-xl max-h-[90vh] overflow-y-auto`}>
          {/* Cabecera del modal */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Perfil completo del operador</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Contenido del modal */}
          <div className="p-6">
            {/* Cabecera con foto y detalles principales */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-shrink-0">
                <div 
                  className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 mx-auto cursor-pointer"
                  onClick={() => handleMostrarImagenAmpliada(
                    operador.foto
                      ? (operador.foto.startsWith('http') ? operador.foto : `http://localhost:10101/uploads/images/${operador.foto}`)
                      : `https://ui-avatars.com/api/?name=${operador.primerNombre ? operador.primerNombre.charAt(0) : ''}${operador.primerApellido ? operador.primerApellido.charAt(0) : ''}&background=0D8ABC&color=fff&size=128`
                  )}
                >
                  <img
                    src={
                      operador.foto
                        ? (operador.foto.startsWith('http') ? operador.foto : `http://localhost:10101/uploads/images/${operador.foto}`)
                        : `https://ui-avatars.com/api/?name=${operador.primerNombre ? operador.primerNombre.charAt(0) : ''}${operador.primerApellido ? operador.primerApellido.charAt(0) : ''}&background=0D8ABC&color=fff&size=128`
                    }
                    alt={`Foto de ${operador.primerNombre || ''} ${operador.primerApellido || ''}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${operador.primerNombre ? operador.primerNombre.charAt(0) : ''}${operador.primerApellido ? operador.primerApellido.charAt(0) : ''}&background=0D8ABC&color=fff&size=128`;
                    }}
                  />
                </div>
                <div className="mt-3 text-center">
                  <div 
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      operador.estado === 'disponible' ? 'bg-green-100 text-green-800' : 
                      operador.estado === 'ocupado' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {operador.estado === 'disponible' ? 'Disponible' : 
                     operador.estado === 'ocupado' ? 'Ocupado' : 
                     'Inactivo'}
                  </div>
                </div>
              </div>
              
              <div className="flex-grow">
                <h1 className="text-2xl font-bold mb-1">{construirNombreCompleto(operador)}</h1>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  {operador.especialidad || 'Operador Turístico General'}
                  {operador.calificacion && (
                    <span className="ml-2 inline-flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm ml-1">{operador.calificacion}</span>
                    </span>
                  )}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-3 text-blue-500" />
                    <span><strong>Cédula:</strong> {operador.cedula || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-3 text-blue-500" />
                    <span><strong>Email:</strong> {operador.email || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3 text-green-500" />
                    <span><strong>Teléfono:</strong> {operador.telefono || operador.numeroCelular || operador.numero_celular || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-3 text-red-500" />
                    <span><strong>Ubicación:</strong> {operador.ubicacion || 'No especificada'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                    <span><strong>Fecha de registro:</strong> {new Date(operador.fecha_registro || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 mr-3 text-purple-500" />
                    <span><strong>Idiomas:</strong> {operador.idiomas || 'No especificados'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  onClose();
                  handleOpenEditarOperadorModal(operador);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Editar información
              </button>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayoutAdmin>
      <div className={`p-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Gestión de Operadores</h1>
          
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
              onClick={handleAddOperador}
              className={`px-3 py-2 rounded-md flex items-center ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              <UserPlus className="w-5 h-5 mr-1.5" />
              Nuevo operador
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
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Total de Operadores</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-700'}`}>
                {operadoresCompletos.length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
              <UserPlus className={`w-6 h-6 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900' : 'bg-green-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Operadores Disponibles</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-green-700'}`}>
                {operadoresCompletos.filter(o => o.estado === 'disponible').length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-green-800' : 'bg-green-100'}`}>
              <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>Operadores Ocupados</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-yellow-700'}`}>
                {operadoresCompletos.filter(o => o.estado === 'ocupado').length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-yellow-800' : 'bg-yellow-100'}`}>
              <Briefcase className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`} />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900' : 'bg-red-50'} flex items-center justify-between`}>
            <div>
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>Operadores Inactivos</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-red-700'}`}>
                {operadoresCompletos.filter(o => o.estado === 'inactivo').length}
              </p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-red-800' : 'bg-red-100'}`}>
              <XCircle className={`w-6 h-6 ${darkMode ? 'text-red-300' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        {/* Lista de operadores */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}>
            <p className="text-lg font-medium mb-2">Error al cargar operadores</p>
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
            {operadoresFiltrados().length > 0 ? (
              operadoresFiltrados().map((operador) => (
                <div 
                  key={operador.id || operador.cedula} 
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
                    <BotonesAccion operador={operador} />
                    
                    {/* Foto de perfil */}
                    <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="w-28 h-28 rounded-full bg-white p-1 shadow-lg overflow-hidden cursor-pointer"
                        onClick={() => handleMostrarImagenAmpliada(
                          operador.foto
                            ? (operador.foto.startsWith('http') ? operador.foto : `http://localhost:10101/uploads/images/${operador.foto}`)
                            : `https://ui-avatars.com/api/?name=${operador.primerNombre ? operador.primerNombre.charAt(0) : ''}${operador.primerApellido ? operador.primerApellido.charAt(0) : ''}&background=0D8ABC&color=fff&size=128`
                        )}
                      >
                        <img
                          src={
                            operador.foto
                              ? (operador.foto.startsWith('http') ? operador.foto : `http://localhost:10101/uploads/images/${operador.foto}`)
                              : `https://ui-avatars.com/api/?name=${operador.primerNombre ? operador.primerNombre.charAt(0) : ''}${operador.primerApellido ? operador.primerApellido.charAt(0) : ''}&background=0D8ABC&color=fff&size=128`
                          }
                          alt={`Foto de ${operador.primerNombre || ''} ${operador.primerApellido || ''}`}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${operador.primerNombre ? operador.primerNombre.charAt(0) : ''}${operador.primerApellido ? operador.primerApellido.charAt(0) : ''}&background=0D8ABC&color=fff&size=128`;
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Insignia de estado */}
                    <div className="absolute top-2 right-2">
                      <EstadoOperador 
                        cedula={operador.cedula} 
                        nombre={construirNombreCompleto(operador)}
                        tamanio="normal" 
                        onChangeEstado={(nuevoEstado) => {
                          // Actualizar el estado en la base de datos
                          actualizarEstadoOperador(operador, nuevoEstado);
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Información del operador */}
                  <div className="pt-16 px-6 pb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold flex items-center justify-center">
                        {construirNombreCompleto(operador)}
                        {operador.calificacion && (
                          <div className="ml-2 flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm ml-1">{operador.calificacion}</span>
                          </div>
                        )}
                      </h3>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {operador.especialidad || 'Operador Turístico General'}
                      </p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="text-sm truncate">{operador.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-3 text-green-500" />
                        <span className="text-sm">{operador.telefono || operador.numeroCelular || operador.numero_celular || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-3 text-red-500" />
                        <span className="text-sm">{operador.ubicacion || 'No especificada'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="text-sm">Desde {new Date(operador.fecha_registro || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-3 text-purple-500" />
                        <span className="text-sm">{operador.cedula || 'No disponible'}</span>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex justify-center gap-2 mt-4">
                      <button 
                        onClick={() => handleOpenDetallesModal(operador)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex-1"
                      >
                        Ver detalles
                      </button>
                      
                      {/* Menú desplegable para cambiar estado */}
                      <div className="relative flex-1">
                        <EstadoOperador 
                          cedula={operador.cedula} 
                          nombre={construirNombreCompleto(operador)}
                          tamanio="boton"
                          onChangeEstado={(nuevoEstado) => {
                            actualizarEstadoOperador(operador, nuevoEstado);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`col-span-3 text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="flex flex-col items-center">
                  <XCircle className="w-16 h-16 mb-4 opacity-30" />
                  <h3 className="text-xl font-semibold mb-2">No se encontraron operadores</h3>
                  <p className="mb-6">No hay operadores que coincidan con los criterios de búsqueda.</p>
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
                      onClick={handleAddOperador}
                      className={`px-4 py-2 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      Añadir nuevo operador
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para crear operador */}
      {showCrearOperadorModal && (
        <CrearOperador 
          onClose={() => setShowCrearOperadorModal(false)} 
          onGuiaCreated={handleOperadorCreated}
        />
      )}

      {/* Modal para eliminar operador */}
      {showEliminarOperadorModal && operadorSeleccionado && (
        <EliminarOperador 
          operador={operadorSeleccionado}
          onClose={() => setShowEliminarOperadorModal(false)}
          onDeleteSuccess={handleOperadorDeleted}
        />
      )}

      {/* Modal para editar operador */}
      {showEditarOperadorModal && operadorParaEditar && (
        <EditarOperador 
          operador={operadorParaEditar}
          onClose={() => {
            setShowEditarOperadorModal(false);
            setOperadorParaEditar(null);
          }}
          onGuiaUpdated={handleOperadorUpdated}
        />
      )}

      {/* Modal para ver detalles completos del operador */}
      {showDetallesModal && operadorDetalle && (
        <DetallesOperadorModal 
          operador={operadorDetalle}
          onClose={() => setShowDetallesModal(false)}
        />
      )}

      {/* Modal para mostrar imagen ampliada */}
      {showImagenModal && (
        <ImagenAmpliadaModal 
          imagenUrl={imagenAmpliada}
          onClose={() => setShowImagenModal(false)}
        />
      )}
    </DashboardLayoutAdmin>
  );
};

export default Operadores; 