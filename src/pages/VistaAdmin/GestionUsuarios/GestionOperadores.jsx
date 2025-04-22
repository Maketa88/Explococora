import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import { Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, Search, Filter, RefreshCw, UserPlus, Award, Star, Briefcase, Globe, Languages, CreditCard, Trash2, Edit, Plus, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoExplococora from '../../../assets/Images/logo.webp';
import EliminarOperador from './EliminarOperador';
import CrearOperador from './CrearOperador';
import EditarOperador from './EditarOperador';
import EstadoOperador from '../../../components/Operadores/EstadoOperador';

// Añadir este componente para las alertas personalizadas
const AlertComponent = ({ alert, setAlert }) => {
  if (!alert.show) return null;
  
  if (alert.type === 'success') {
    return (
      <div className="fixed top-4 right-4 z-50 animate-fadeIn">
        <div className="bg-green-500 text-white px-6 py-4 rounded-md shadow-xl flex items-center">
          <CheckCircle className="w-6 h-6 mr-3" />
          <span className="font-medium text-lg">{alert.message}</span>
          <button 
            onClick={() => setAlert(prev => ({ ...prev, show: false }))}
            className="ml-4 text-white hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
  
  // Alertas específicas para cambio de estado
  if (alert.type === 'estado-disponible') {
    return (
      <div className="fixed top-4 right-4 z-50 animate-fadeIn">
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-md shadow-xl flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mr-3 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
          </svg>
          <span className="font-medium">{alert.message}</span>
          <button 
            onClick={() => setAlert(prev => ({ ...prev, show: false }))}
            className="ml-4 text-green-700 hover:text-green-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
  
  if (alert.type === 'estado-ocupado') {
    return (
      <div className="fixed top-4 right-4 z-50 animate-fadeIn">
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 px-6 py-4 rounded-md shadow-xl flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mr-3 text-amber-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
          </svg>
          <span className="font-medium">{alert.message}</span>
          <button 
            onClick={() => setAlert(prev => ({ ...prev, show: false }))}
            className="ml-4 text-amber-700 hover:text-amber-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
  
  if (alert.type === 'estado-inactivo') {
    return (
      <div className="fixed top-4 right-4 z-50 animate-fadeIn">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-md shadow-xl flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mr-3 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
          </svg>
          <span className="font-medium">{alert.message}</span>
          <button 
            onClick={() => setAlert(prev => ({ ...prev, show: false }))}
            className="ml-4 text-red-700 hover:text-red-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
  
  // Alerta de error
  return (
    <div className="fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 bg-red-600 text-white">
      <AlertCircle className="w-5 h-5" />
      <span>{alert.message}</span>
      <button 
        onClick={() => setAlert(prev => ({ ...prev, show: false }))}
        className="ml-2 text-white hover:text-gray-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

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
  // Añadir estado para alertas personalizadas
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

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

  // Función para mostrar alertas
  const showAlert = (message, type) => {
    setAlert({
      show: true,
      message,
      type
    });
    
    // Ocultar la alerta después de un tiempo
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, type === 'success' ? 5000 : 4000);
  };

  // Función para manejar la creación exitosa de un operador
  const handleOperadorCreated = (nuevoOperador) => {
    // Actualizar la lista de operadores
    setOperadoresCompletos(prevOperadores => [
      { ...nuevoOperador, estado: 'disponible' }, 
      ...prevOperadores
    ]);
    showAlert("Operador creado correctamente", "success");
  };

  // Función para manejar la eliminación exitosa de un operador
  const handleOperadorDeleted = (cedulaOperadorEliminado) => {
    // Actualizar la lista de operadores eliminando el que se borró
    setOperadoresCompletos(prevOperadores => 
      prevOperadores.filter(operador => operador.cedula !== cedulaOperadorEliminado)
    );
    showAlert("Operador eliminado correctamente", "success");
  };

  // Función para manejar la actualización exitosa de un operador
  const handleOperadorUpdated = (operadorActualizado) => {
    // Actualizar la lista de operadores
    setOperadoresCompletos(prevOperadores => 
      prevOperadores.map(operador => 
        operador.cedula === operadorActualizado.cedula ? operadorActualizado : operador
      )
    );
    showAlert("Información del operador actualizada correctamente", "success");
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
      const response = await axios.get(`https://servicio-explococora.onrender.com/usuarios/consultar-estado/cedula/${cedula}`, {
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
      // Normalizar el estado para consistencia
      const estadoNormalizado = nuevoEstado.toLowerCase().trim();
      
      // Actualizar el estado en el frontend inmediatamente para mejor experiencia de usuario
      const operadoresActualizados = operadoresCompletos.map(o => {
        if (o.cedula === operador.cedula) {
          return { ...o, estado: estadoNormalizado };
        }
        return o;
      });
      
      setOperadoresCompletos(operadoresActualizados);
      
      // Obtener el nombre completo del operador
      const nombreCompleto = construirNombreCompleto(operador);
      
      // Determinar el tipo de alerta según el estado
      let tipoAlerta = 'estado-disponible'; // valor por defecto
      
      if (estadoNormalizado === 'ocupado') {
        tipoAlerta = 'estado-ocupado';
      } else if (estadoNormalizado === 'inactivo') {
        tipoAlerta = 'estado-inactivo';
      }
      
      // Mostrar notificación de estado con campana y color según el estado
      setAlert({
        show: true,
        message: `El estado de ${nombreCompleto} ha cambiado a ${estadoNormalizado.charAt(0).toUpperCase() + estadoNormalizado.slice(1)}`,
        type: tipoAlerta
      });
      
      // Establecer tiempo de duración más largo para esta alerta
      setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }));
      }, 6000);
      
      // Sincronización silenciosa con el servidor (sin mostrar errores)
      const token = localStorage.getItem('token');
      if (token) {
        // Crear un elemento imagen invisible como técnica para evitar errores en consola
        const img = new Image();
        img.style.display = 'none';
        document.body.appendChild(img);
        
        // Usar setTimeout para ejecutar la petición de manera asíncrona
        setTimeout(() => {
          // Crear la petición manualmente con XMLHttpRequest para tener control completo
          const xhr = new XMLHttpRequest();
          
          // Configurar para que no muestre errores en consola
          xhr.onerror = () => {
            // Función vacía para evitar mensajes de error
          };
          
          // Manejar la respuesta silenciosamente
          xhr.onload = () => {
            // Solo disparar evento si la respuesta es exitosa
            if (xhr.status >= 200 && xhr.status < 300) {
              window.dispatchEvent(new CustomEvent('operadorEstadoCambiado', { 
                detail: { cedula: operador.cedula, nuevoEstado: estadoNormalizado }
              }));
            }
            
            // Limpiar el elemento temporal
            if (document.body.contains(img)) {
              document.body.removeChild(img);
            }
          };
          
          // Abrir y enviar la petición
          xhr.open('PATCH', `https://servicio-explococora.onrender.com/usuarios/cambiar-estado/cedula/${operador.cedula}`, true);
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify({ estado: estadoNormalizado }));
        }, 0);
      }
      
      // Actualizar contadores si tenemos la función
      if (typeof obtenerContadores === 'function') {
        obtenerContadores(true);
      }
    } catch (error) {
      // Capturar y silenciar todos los errores
    }
  };

  // Función para actualizar estados en tiempo real
  const actualizarEstados = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert("No hay token de autenticación. Por favor, inicie sesión nuevamente.", "error");
        return;
      }
      
      const response = await axios.get('https://servicio-explococora.onrender.com/usuarios/listar-estados', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        validateStatus: function (status) {
          return status < 500;
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
        
        showAlert("Estados actualizados correctamente", "success");
      } else {
        showAlert(response.data?.message || "Error al actualizar estados", "error");
      }
    } catch (error) {
      showAlert("No se pudieron actualizar los estados", "error");
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
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('operadorEstadoCambiado', handleEstadoCambiado);
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
          'https://servicio-explococora.onrender.com/operador-turistico',
          'https://servicio-explococora.onrender.com/operador-turistico',
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
              const perfilResponse = await axios.get(`https://servicio-explococora.onrender.com/operador-turistico/perfil-completo/${operador.cedula}`, {
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
        <div className="relative w-full max-w-4xl bg-white text-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Cabecera del modal */}
          <div className="bg-emerald-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Perfil de Operador</h2>
            <button 
              onClick={onClose}
              className="text-white hover:bg-emerald-700 rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Contenido del modal */}
          <div className="p-3 sm:p-6 bg-emerald-50/30">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              {/* Columna izquierda - foto y estado */}
              <div className="flex flex-col items-center mx-auto md:mx-0 mb-6 md:mb-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-emerald-500 mb-4">
                  <img
                    src={
                      operador.foto
                        ? (operador.foto.startsWith('http') ? operador.foto : `https://servicio-explococora.onrender.com/uploads/images/${operador.foto}`)
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
                
                <div className="px-4 py-2 bg-emerald-500 text-white rounded-md text-center w-full max-w-[180px]">
                  {operador.estado || 'Disponible'}
                </div>
              </div>
              
              {/* Columna derecha - información */}
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 text-center md:text-left">
                  {construirNombreCompleto(operador)}
                </h3>
                <p className="text-gray-500 mb-6 text-center md:text-left">
                  {operador.especialidad || 'Operador Turístico General'}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  <div className="flex items-start space-x-2">
                    <CreditCard className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                      <p className="text-xs text-gray-500">Cédula:</p>
                      <p className="text-sm text-gray-800">{operador.cedula || 'No disponible'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Mail className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                      <p className="text-xs text-gray-500">Email:</p>
                      <p className="text-sm text-gray-800">{operador.email || 'No disponible'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Phone className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                      <p className="text-xs text-gray-500">Teléfono:</p>
                      <p className="text-sm text-gray-800">{operador.telefono || operador.numeroCelular || operador.numero_celular || 'No disponible'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                      <p className="text-xs text-gray-500">Ubicación:</p>
                      <p className="text-sm text-gray-800">{operador.ubicacion || 'No especificada'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Calendar className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                      <p className="text-xs text-gray-500">Fecha de registro:</p>
                      <p className="text-sm text-gray-800">{new Date(operador.fecha_registro || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Languages className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                      <p className="text-xs text-gray-500">Idiomas:</p>
                      <p className="text-sm text-gray-800">{operador.idiomas || 'No especificados'}</p>
                    </div>
                  </div>
                </div>
                
                {operador.descripcion && (
                  <div className="mt-6 col-span-full">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Descripción:</h4>
                    <div className="p-3 bg-white rounded-lg border border-emerald-100">
                      <p className="text-sm text-gray-700">{operador.descripcion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  onClose();
                  handleOpenEditarOperadorModal(operador);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors duration-200"
              >
                Editar información
              </button>
              <button
                onClick={() => onClose()}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors duration-200"
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
      {/* Incluir el componente de alertas */}
      <AlertComponent alert={alert} setAlert={setAlert} />
      
      <div className="p-6 bg-white">
        {/* Cabecera con título y botones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Operadores</h1>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            {/* Barra de búsqueda adaptativa */}
            <div className="relative flex items-center w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-emerald-600" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[280px] md:w-[350px] py-2 px-4 rounded-lg bg-white text-gray-800 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            {/* Botones adaptables */}
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`py-2 px-4 flex-1 sm:flex-initial bg-white border border-gray-200 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-gray-50 ${mostrarFiltros ? 'border-emerald-500' : ''}`}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filtros
              </button>
              
              <button
                onClick={handleAddOperador}
                className="py-2 px-4 flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Nuevo operador
              </button>
            </div>
          </div>
        </div>
        
        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-white to-emerald-50 border border-emerald-100 shadow-lg transition-all duration-300 ease-in-out animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">Estado</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFiltroEstado('todos')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'todos' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstado('disponible')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'disponible' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Disponible
                  </button>
                  <button
                    onClick={() => setFiltroEstado('ocupado')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'ocupado' 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Ocupado
                  </button>
                  <button
                    onClick={() => setFiltroEstado('inactivo')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      filtroEstado === 'inactivo' 
                        ? 'bg-red-100 text-red-800 border border-red-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Inactivo
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">Ordenar por</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setOrdenarPor('nombre')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      ordenarPor === 'nombre' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Nombre
                  </button>
                  <button
                    onClick={() => setOrdenarPor('fecha')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      ordenarPor === 'fecha' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
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
                  className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors duration-200"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de operadores */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 rounded-lg text-center bg-red-50 text-red-800 border border-red-200">
            <p className="text-lg font-medium mb-2">Error al cargar operadores</p>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
            {operadoresFiltrados().length > 0 ? (
              operadoresFiltrados().map((operador) => (
                <div 
                  key={operador.id || operador.cedula} 
                  className="rounded-lg shadow-lg overflow-hidden bg-white relative group"
                  onClick={(e) => {
                    if (!e.isDefaultPrevented()) {
                      handleOpenDetallesModal(operador);
                    }
                  }}
                >
                  <div className="absolute top-2 left-2 flex space-x-2 z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEliminarOperadorModal(operador);
                      }}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                      title="Eliminar operador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditarOperadorModal(operador);
                      }}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg"
                      title="Editar operador"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Cabecera con imagen - ajustando altura */}
                  <div 
                    className="h-32 sm:h-36 relative bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${logoExplococora})`,
                      backgroundSize: '200px',
                      backgroundPosition: 'center',
                      backgroundColor: '#10b981',
                      backgroundBlendMode: 'soft-light',
                      opacity: '0.9'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-700 to-emerald-400/30 opacity-40"></div>
                    <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
                      <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-emerald-200 shadow-lg">
                        <img
                          src={
                            operador.foto
                              ? (operador.foto.startsWith('http') ? operador.foto : `https://servicio-explococora.onrender.com/uploads/images/${operador.foto}`)
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
                    </div>
                    
                    {/* Estado del operador con manejo especial de eventos */}
                    <div className="absolute top-2 right-2 z-10" onClick={(e) => e.preventDefault()}>
                      <EstadoOperador 
                        cedula={operador.cedula} 
                        nombre={construirNombreCompleto(operador)}
                        tamanio="normal"
                        onChangeEstado={(nuevoEstado) => {
                          // Aplicar el cambio directamente sin validaciones adicionales
                          actualizarEstadoOperador(operador, nuevoEstado);
                        }}
                        colorDisponible="bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                        colorOcupado="bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300"
                        colorInactivo="bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                        estadoActual={operador.estado || 'disponible'}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Información del operador - igual que en GestionGuias */}
                  <div className="pt-16 px-4 sm:px-6 pb-4 sm:pb-6 bg-gradient-to-b from-white to-emerald-50/50">
                    <div className="text-center mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                        {construirNombreCompleto(operador)}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-600 mt-1">
                        {operador.especialidad || 'Operador Turístico General'}
                      </p>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex items-center p-2 rounded-md hover:bg-emerald-100 transition-colors duration-200">
                        <Mail className="w-4 h-4 mr-2 sm:mr-3 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate text-gray-700">{operador.email}</span>
                      </div>
                      <div className="flex items-center p-2 rounded-md hover:bg-emerald-100 transition-colors duration-200">
                        <Phone className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700">{operador.telefono || operador.numeroCelular || operador.numero_celular || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center p-2 rounded-md hover:bg-emerald-100 transition-colors duration-200">
                        <MapPin className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700">{operador.ubicacion || 'No especificada'}</span>
                      </div>
                      <div className="flex items-center p-2 rounded-md hover:bg-emerald-100 transition-colors duration-200">
                        <Calendar className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700">Desde {new Date(operador.fecha_registro || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center p-2 rounded-md hover:bg-emerald-100 transition-colors duration-200">
                        <CreditCard className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700">{operador.cedula || 'No disponible'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetallesModal(operador);
                        }}
                        className="px-4 sm:px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs sm:text-sm font-medium w-full max-w-[200px] flex items-center justify-center"
                      >
                        <span>Ver detalles</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-600">
                <div className="flex flex-col items-center">
                  <XCircle className="w-16 h-16 mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No se encontraron operadores</h3>
                  <p className="mb-6">No hay operadores que coincidan con los criterios de búsqueda.</p>
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
                      onClick={handleAddOperador}
                      className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white"
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
      
      {/* Modal para ver detalles completos del operador - actualizado */}
      {showDetallesModal && operadorDetalle && (
        <DetallesOperadorModal 
          operador={operadorDetalle}
          onClose={() => setShowDetallesModal(false)}
        />
      )}
      
      {/* Los demás modales se mantienen igual */}
      {showCrearOperadorModal && (
        <CrearOperador 
          onClose={() => setShowCrearOperadorModal(false)} 
          onOperadorCreated={handleOperadorCreated}
        />
      )}

      {showEliminarOperadorModal && operadorSeleccionado && (
        <EliminarOperador 
          operador={operadorSeleccionado}
          onClose={() => setShowEliminarOperadorModal(false)}
          onDeleteSuccess={handleOperadorDeleted}
        />
      )}

      {showEditarOperadorModal && operadorParaEditar && (
        <EditarOperador 
          operador={operadorParaEditar}
          onClose={() => {
            setShowEditarOperadorModal(false);
            setOperadorParaEditar(null);
          }}
          onOperadorUpdated={handleOperadorUpdated}
        />
      )}

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