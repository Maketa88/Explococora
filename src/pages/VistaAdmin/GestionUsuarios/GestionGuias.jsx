import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import { Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, Search, Filter, RefreshCw, UserPlus, Award, Star, Briefcase, Globe, Languages, CreditCard, Trash2, Edit, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoExplococora from '../../../assets/Images/logo.webp';
import { toast } from 'react-toastify';
import EliminarGuia from './EliminarGuia';
import CrearGuia from './CrearGuia';
import EditarGuia from './EditarGuia';
import EstadoGuia from '../../../components/Guias/EstadoGuia';
import { FaIdCard } from 'react-icons/fa';

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
  // Estados para modales
  const [showCrearGuiaModal, setShowCrearGuiaModal] = useState(false);
  const [showEliminarGuiaModal, setShowEliminarGuiaModal] = useState(false);
  const [showEditarGuiaModal, setShowEditarGuiaModal] = useState(false);
  const [guiaSeleccionado, setGuiaSeleccionado] = useState(null);
  const [guiaParaEditar, setGuiaParaEditar] = useState(null);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [guiaDetalle, setGuiaDetalle] = useState(null);
  const [showImagenModal, setShowImagenModal] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  // Función para abrir modal de crear guía
  const handleOpenCrearGuiaModal = () => {
    setShowCrearGuiaModal(true);
  };

  // Función para abrir modal de eliminar guía
  const handleOpenEliminarGuiaModal = (guia) => {
    setGuiaSeleccionado(guia);
    setShowEliminarGuiaModal(true);
  };

  // Función para abrir modal de editar guía
  const handleOpenEditarGuiaModal = (guia) => {
    console.log("Abriendo modal de edición para guía:", guia);
    setGuiaParaEditar(guia);
    setShowEditarGuiaModal(true);
  };

  // Función para manejar la creación exitosa de un guía
  const handleGuiaCreated = (nuevoGuia) => {
    // Actualizar la lista de guías
    setGuiasCompletos(prevGuias => [
      { ...nuevoGuia, estado: 'disponible' }, 
      ...prevGuias
    ]);
    toast.success("Guía creado correctamente");
  };

  // Función para manejar la eliminación exitosa de un guía
  const handleGuiaDeleted = (cedulaGuiaEliminado) => {
    // Actualizar la lista de guías eliminando el que se borró
    setGuiasCompletos(prevGuias => 
      prevGuias.filter(guia => guia.cedula !== cedulaGuiaEliminado)
    );
    toast.success("Guía eliminado correctamente");
  };

  // Función para manejar la actualización exitosa de un guía
  const handleGuiaUpdated = (guiaActualizado) => {
    console.log("Guía actualizado:", guiaActualizado);
    // Actualizar la lista de guías
    setGuiasCompletos(prevGuias => 
      prevGuias.map(guia => 
        guia.cedula === guiaActualizado.cedula ? guiaActualizado : guia
      )
    );
    toast.success("Información del guía actualizada correctamente");
  };

  // Función para redirigir a la página de nuevo guía (ahora usamos el modal en su lugar)
  const handleAddGuia = () => {
    handleOpenCrearGuiaModal();
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
  const obtenerEstadoGuia = async (cedula) => {
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
      console.error(`Error al obtener estado del Guia ${cedula}:`, error);
      return 'disponible';
    }
  };

  // Función para actualizar el estado de un guía
  const actualizarEstadoGuia = async (guia, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("No hay token de autenticación. Por favor, inicie sesión nuevamente.");
        return;
      }

      // Llamada a la API para actualizar el estado
      const response = await axios.patch(
        `http://localhost:10101/usuarios/cambiar-estado/cedula/${guia.cedula}`,
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
        const guiasActualizados = guiasCompletos.map(g => {
          if (g.cedula === guia.cedula) {
            return { ...g, estado: nuevoEstado };
          }
          return g;
        });
        
        setGuiasCompletos(guiasActualizados);
        toast.success(`Estado del guía actualizado a: ${nuevoEstado}`);
      } else {
        throw new Error(response.data?.message || "Error al actualizar estado");
      }
    } catch (error) {
      // Eliminar o modificar console.log si existe aquí también
      // Si hay un toast.error u otra UI de error, podemos mantenerla
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
        
        setGuiasCompletos(prevGuias => {
          return prevGuias.map(guia => {
            const estadoActualizado = nuevosEstados.find(
              e => e.cedula === guia.cedula || e.id === guia.id
            );
            
            if (estadoActualizado) {
              return {
                ...guia,
                estado: estadoActualizado.estado
              };
            }
            return guia;
          });
        });
        
        toast.success("Estados actualizados correctamente");
      } else {
        throw new Error(response.data?.message || "Error al actualizar estados");
      }
    } catch (error) {
      // Eliminar el console.log que muestra el error
      // console.error("Error al actualizar estados:", error);
      
      // Opcionalmente, podemos mantener la lógica pero sin mostrar el mensaje en consola
      // Si se necesita otra lógica para manejar el error, mantenerla pero sin el console.log
    }
  };

  // Añadir este efecto para escuchar cambios de estado
  useEffect(() => {
    // Función que actualiza los guías cuando cambia el estado
    const handleEstadoCambiado = (event) => {
      if (!event.detail || !event.detail.cedula) return;
      
      // Actualizar el guía en la lista
      setGuiasCompletos(prevGuias => {
        const nuevosGuias = prevGuias.map(guia => {
          if (guia.cedula === event.detail.cedula) {
            return { ...guia, estado: event.detail.nuevoEstado };
          }
          return guia;
        });
        
        return nuevosGuias;
      });
    };
    
    // Suscribirse al evento global de cambio de estado
    window.addEventListener('guiaEstadoCambiado', handleEstadoCambiado);
    
    // Configurar intervalo para actualizar estados cada 30 segundos
    const intervalId = setInterval(actualizarEstados, 30000);
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('guiaEstadoCambiado', handleEstadoCambiado);
      clearInterval(intervalId);
    };
  }, []);

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
              const estado = await obtenerEstadoGuia(guia.cedula);
              
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
        
        // Actualizar estados inmediatamente después de cargar los guías
        await actualizarEstados();
        
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

  // Componente para botones de acción en tarjeta
  const BotonesAccion = ({ guia }) => {
    return (
      <div className="absolute top-2 left-2 flex space-x-2">
        {/* Botón para eliminar guía */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEliminarGuiaModal(guia);
          }}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
          title="Eliminar guía"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        
        {/* Botón para actualizar información */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEditarGuiaModal(guia);
          }}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
          title="Actualizar información"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Función para abrir modal de detalles
  const handleOpenDetallesModal = (guia) => {
    setGuiaDetalle(guia);
    setShowDetallesModal(true);
  };

  // Función para mostrar imagen ampliada
  const handleMostrarImagenAmpliada = (imagenUrl) => {
    setImagenAmpliada(imagenUrl);
    setShowImagenModal(true);
  };

  // Componente para imagen ampliada
  const ImagenAmpliadaModal = ({ imagenUrl, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="relative max-w-4xl w-full max-h-[90vh]">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="h-8 w-8" />
          </button>
          <img 
            src={imagenUrl} 
            alt="Imagen ampliada" 
            className="max-w-full max-h-[85vh] mx-auto object-contain"
          />
        </div>
      </div>
    );
  };

  // Componente para mostrar detalles completos del guía
  const DetallesGuiaModal = ({ guia, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white text-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Perfil completo del guía</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-500 mb-4">
                  <img 
                    src={
                      guia.foto
                        ? (guia.foto.startsWith('http') ? guia.foto : `http://localhost:10101/uploads/images/${guia.foto}`)
                        : "https://i.pinimg.com/736x/8d/37/31/8d3731a57b8209114c08488eeb0b6a64.jpg"
                    }
                    alt={`Foto de ${guia.primerNombre || ''} ${guia.primerApellido || ''}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://i.pinimg.com/736x/8d/37/31/8d3731a57b8209114c08488eeb0b6a64.jpg";
                    }}
                  />
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center mb-4 ${
                  guia.estado === 'disponible' ? 'bg-emerald-100 text-emerald-800' : 
                  guia.estado === 'ocupado' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {guia.estado === 'disponible' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Disponible
                    </>
                  ) : guia.estado === 'ocupado' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Ocupado
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Inactivo
                    </>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      onClose();
                      handleOpenEditarGuiaModal(guia);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar información
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {construirNombreCompleto(guia)}
                </h3>
                <p className="text-emerald-600 font-medium mb-4">
                  {guia.especialidad || 'Guía Turístico General'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mr-3">
                      <FaIdCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cédula:</p>
                      <p className="font-medium text-gray-800">{guia.cedula}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mr-3">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email:</p>
                      <p className="font-medium text-gray-800">{guia.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mr-3">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono:</p>
                      <p className="font-medium text-gray-800">{guia.telefono || guia.numeroCelular || guia.numero_celular || 'No especificado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mr-3">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ubicación:</p>
                      <p className="font-medium text-gray-800">{guia.ubicacion || 'No especificada'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mr-3">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de registro:</p>
                      <p className="font-medium text-gray-800">{new Date(guia.fecha_registro || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mr-3">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Idiomas:</p>
                      <p className="font-medium text-gray-800">{guia.idiomas || 'No especificados'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      {guia.descripcion || 'No hay descripción disponible para este guía.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      handleOpenEditarGuiaModal(guia);
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    Editar información
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayoutAdmin>
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Guías</h1>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-64 md:w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 text-emerald-600" />
              <span className="text-gray-700">Filtros</span>
            </button>
            
            <button
              onClick={handleAddGuia}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Nuevo guía</span>
            </button>
          </div>
        </div>
        
        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mb-6 p-4 rounded-lg bg-white shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">Estado</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFiltroEstado('todos')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'todos' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstado('disponible')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'disponible' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    Disponible
                  </button>
                  <button
                    onClick={() => setFiltroEstado('ocupado')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'ocupado' 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    Ocupado
                  </button>
                  <button
                    onClick={() => setFiltroEstado('inactivo')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'inactivo' 
                        ? 'bg-red-100 text-red-800 border border-red-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    Inactivo
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">Ordenar por</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrdenarPor('nombre')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      ordenarPor === 'nombre' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    Nombre
                  </button>
                  <button
                    onClick={() => setOrdenarPor('fecha')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      ordenarPor === 'fecha' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
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
                  className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-emerald-50 border-l-4 border-emerald-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700">Total de Guías</p>
              <p className="text-2xl font-bold text-emerald-800">
                {guiasCompletos.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-emerald-100">
              <UserPlus className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-green-50 border-l-4 border-green-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Guías Disponibles</p>
              <p className="text-2xl font-bold text-green-800">
                {guiasCompletos.filter(g => g.estado === 'disponible').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Guías Ocupados</p>
              <p className="text-2xl font-bold text-yellow-800">
                {guiasCompletos.filter(g => g.estado === 'ocupado').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Briefcase className="w-6 h-6 text-yellow-500" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Guías Inactivos</p>
              <p className="text-2xl font-bold text-red-800">
                {guiasCompletos.filter(g => g.estado === 'inactivo').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Lista de guías */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 rounded-lg text-center bg-red-50 text-red-800 border border-red-200">
            <p className="text-lg font-medium mb-2">Error al cargar guías</p>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {guiasFiltrados().length > 0 ? (
              guiasFiltrados().map((guia) => (
                <div 
                  key={guia.id || guia.cedula} 
                  className="rounded-lg shadow-sm overflow-hidden bg-white border border-gray-100 relative cursor-pointer"
                  onClick={() => handleOpenDetallesModal(guia)}
                >
                  {/* Cabecera con imagen */}
                  <div 
                    className="h-28 relative bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${logoExplococora})`,
                      backgroundSize: '150px',
                      backgroundPosition: 'center',
                      backgroundColor: '#10b981', // emerald-500
                      backgroundBlendMode: 'soft-light',
                      opacity: '0.9'
                    }}
                  >
                    {/* Botones de acción */}
                    <div className="absolute top-2 left-2 flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEliminarGuiaModal(guia);
                        }}
                        className="p-2 bg-white hover:bg-red-50 text-red-500 rounded-full shadow-sm"
                        title="Eliminar guía"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditarGuiaModal(guia);
                        }}
                        className="p-2 bg-white hover:bg-emerald-50 text-emerald-500 rounded-full shadow-sm"
                        title="Actualizar información"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Foto de perfil */}
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                      <div className="w-20 h-20 rounded-full bg-white p-1 shadow-sm overflow-hidden">
                        <img
                          src={
                            guia.foto
                              ? (guia.foto.startsWith('http') ? guia.foto : `http://localhost:10101/uploads/images/${guia.foto}`)
                              : "https://i.pinimg.com/736x/8d/37/31/8d3731a57b8209114c08488eeb0b6a64.jpg"
                          }
                          alt={`Foto de ${guia.primerNombre || ''} ${guia.primerApellido || ''}`}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://i.pinimg.com/736x/8d/37/31/8d3731a57b8209114c08488eeb0b6a64.jpg";
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Insignia de estado */}
                    <div className="absolute top-2 right-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                        guia.estado === 'disponible' ? 'bg-green-100 text-green-800' : 
                        guia.estado === 'ocupado' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {guia.estado === 'disponible' ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Disponible
                          </>
                        ) : guia.estado === 'ocupado' ? (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Ocupado
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Información del guía */}
                  <div className="pt-12 px-4 pb-4">
                    <div className="text-center mb-3">
                      <h3 className="text-lg font-bold text-gray-800 truncate">
                        {construirNombreCompleto(guia)}
                      </h3>
                      <p className="text-xs text-emerald-600">
                        {guia.especialidad || 'Guía Turístico General'}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{guia.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{guia.telefono || guia.numeroCelular || guia.numero_celular || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{guia.ubicacion || 'No especificada'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-600 truncate">Desde {new Date(guia.fecha_registro || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex justify-center gap-2 mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetallesModal(guia);
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-medium flex-1"
                      >
                        Ver detalles
                      </button>
                      
                      {/* Menú desplegable para cambiar estado */}
                      <div className="relative flex-1">
                        <EstadoGuia 
                          cedula={guia.cedula} 
                          nombre={construirNombreCompleto(guia)}
                          tamanio="boton"
                          onChangeEstado={(nuevoEstado) => {
                            actualizarEstadoGuia(guia, nuevoEstado);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-gray-600">
                <div className="flex flex-col items-center">
                  <XCircle className="w-16 h-16 mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No se encontraron guías</h3>
                  <p className="mb-6">No hay guías que coincidan con los criterios de búsqueda.</p>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setFiltroEstado('todos');
                      }}
                      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      Limpiar filtros
                    </button>
                    <button 
                      onClick={handleAddGuia}
                      className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white"
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

      {/* Modal para crear guía */}
      {showCrearGuiaModal && (
        <CrearGuia 
          onClose={() => setShowCrearGuiaModal(false)} 
          onGuiaCreated={handleGuiaCreated}
        />
      )}

      {/* Modal para eliminar guía */}
      {showEliminarGuiaModal && guiaSeleccionado && (
        <EliminarGuia 
          guia={guiaSeleccionado}
          onClose={() => setShowEliminarGuiaModal(false)}
          onDeleteSuccess={handleGuiaDeleted}
        />
      )}

      {/* Modal para editar guía */}
      {showEditarGuiaModal && guiaParaEditar && (
        <EditarGuia 
          guia={guiaParaEditar}
          onClose={() => {
            setShowEditarGuiaModal(false);
            setGuiaParaEditar(null);
          }}
          onGuiaUpdated={handleGuiaUpdated}
        />
      )}

      {/* Modal para ver detalles completos del guía */}
      {showDetallesModal && guiaDetalle && (
        <DetallesGuiaModal 
          guia={guiaDetalle}
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

export default Guias; 