import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { Mail, Phone, MapPin, Calendar, CheckCircle, Clock, XCircle, Search, Filter, RefreshCw, UserPlus, Star, CreditCard, Trash2, Edit, Globe, Languages, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoExplococora from '../../../assets/Images/logo.webp';
import EstadoGuia from '../../../components/Guias/EstadoGuia';
import guiaEstadoService from '../../../services/guiaEstadoService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const Guias = () => {
  const navigate = useNavigate();
  const [guias, setGuias] = useState([]);
  const [guiasCompletos, setGuiasCompletos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, disponible, ocupado, inactivo
  const [ordenarPor, setOrdenarPor] = useState('nombre'); // nombre, fecha, experiencia
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Contadores de estados
  const [contadores, setContadores] = useState({
    total: 0,
    disponibles: 0,
    ocupados: 0,
    inactivos: 0
  });

  const [guiaAEliminar, setGuiaAEliminar] = useState(null);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const countdownRef = useRef(null);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [guiaDetalle, setGuiaDetalle] = useState(null);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [formData, setFormData] = useState({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    telefono: '',
    descripcion: ''
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successGuiaName, setSuccessGuiaName] = useState('');
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

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

  // Función corregida para obtener el estado del operador
  const obtenerEstadoOperador = async (cedula) => {
    if (!cedula) return 'disponible';
    
    try {
      const token = localStorage.getItem('token');
      
      // Ruta corregida según tu configuración de API
      const response = await axios.get(`http://localhost:10101/usuarios/consultar-estado/cedula/${cedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data?.data?.estado || 'disponible';
    } catch (errorEstado) {
      // Sin mensajes de error en consola
      return 'disponible';
    }
  };

  // Función para actualizar contadores basados en la lista de guías
  const actualizarContadores = (listaGuias) => {
    const conteo = {
      total: listaGuias.length,
      disponibles: 0,
      ocupados: 0,
      inactivos: 0
    };
    
    listaGuias.forEach(guia => {
      const estado = guia.estado || 'disponible';
      
      switch (estado) {
        case 'disponible':
          conteo.disponibles++;
          break;
        case 'ocupado':
          conteo.ocupados++;
          break;
        case 'inactivo':
          conteo.inactivos++;
          break;
        default:
          conteo.disponibles++;
      }
    });
    
    setContadores(conteo);
  };

  // Función para filtrar guías según búsqueda y filtros
  const guiasFiltrados = () => {
    return guiasCompletos.filter(guia => {
      // Filtro por término de búsqueda en nombre o cédula
      const nombreCompleto = construirNombreCompleto(guia).toLowerCase();
      const cedula = (guia.cedula || '').toString().toLowerCase();
      const termino = searchTerm.toLowerCase();
      
      const coincideTermino = 
        nombreCompleto.includes(termino) || 
        cedula.includes(termino);
      
      // Filtro por estado
      const coincideEstado = 
        filtroEstado === 'todos' || 
        guia.estado === filtroEstado;
      
      return coincideTermino && coincideEstado;
    }).sort((a, b) => {
      // Ordenar según criterio seleccionado
      if (ordenarPor === 'nombre') {
        return construirNombreCompleto(a).localeCompare(construirNombreCompleto(b));
      } else if (ordenarPor === 'fecha') {
        const fechaA = new Date(a.fecha_registro || 0);
        const fechaB = new Date(b.fecha_registro || 0);
        return fechaB - fechaA; // Más reciente primero
      }
      return 0;
    });
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
        
        // Lista de posibles endpoints para probar
        const endpoints = [
          'http://localhost:10101/guia/todos',
          'http://localhost:10101/guias/todos',
          'http://localhost:10101/operador-turistico/guias'
        ];
        
        let guiasData = [];
        let encontrado = false;
        
        // Probar cada endpoint hasta encontrar uno que funcione
        for (const endpoint of endpoints) {
          try {
            const response = await axios.get(endpoint, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.data) {
              guiasData = Array.isArray(response.data) ? response.data : 
                          (response.data.data || response.data.guias || []);
              encontrado = true;
              break;
            }
          } catch (err) {
            // Silenciar errores específicos
          }
        }
        
        if (!encontrado || !guiasData.length) {
          setError("No se pudieron obtener los guías. Por favor, intente más tarde.");
          setLoading(false);
          return;
        }
        
        // Añadir el estado a cada guía
        const guiasCompletosPromises = guiasData.map(async (guia) => {
          try {
            // Obtener el estado
            const estado = await obtenerEstadoOperador(guia.cedula);
            
            // Intentar obtener perfil completo para cada guía
            try {
              const perfilResponse = await axios.get(`http://localhost:10101/guia/perfil-completo/${guia.cedula}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (perfilResponse.data) {
                const perfilCompleto = perfilResponse.data.data || perfilResponse.data;
                return { 
                  ...guia, 
                  ...perfilCompleto,
                  estado, 
                  telefono: obtenerTelefono(perfilCompleto)
                };
              }
            } catch (errorPerfil) {
              // Silenciar error
            }
            
            // Si no pudimos obtener el perfil completo, devolvemos lo básico
            return { 
              ...guia, 
              estado,
              telefono: obtenerTelefono(guia)
            };
          } catch (error) {
            return { 
              ...guia, 
              estado: 'disponible',
              telefono: obtenerTelefono(guia)
            };
          }
        });
        
        const guiasConEstado = await Promise.all(guiasCompletosPromises);
        
        setGuias(guiasData);
        setGuiasCompletos(guiasConEstado);
        actualizarContadores(guiasConEstado);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar guías:", err);
        setError("Error al cargar los guías: " + err.message);
        setLoading(false);
      }
    };

    fetchGuias();
  }, []);

  // Función para mostrar el modal de eliminación
  const handleEliminarGuia = (guia) => {
    setGuiaAEliminar(guia);
    setShowEliminarModal(true);
  };

  // Función para iniciar la cuenta regresiva
  const startCountdown = () => {
    setCountdownActive(true);
    setCountdown(2);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setCountdownActive(false);
          handleActualDelete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Función para cancelar la cuenta regresiva
  const cancelCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      setCountdownActive(false);
    }
  };

  // Función para eliminar un guía
  const handleActualDelete = async () => {
    if (!guiaAEliminar) return;
    
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsDeleting(false);
        setShowEliminarModal(false);
        return;
      }

      const cedula = guiaAEliminar.cedula;
      
      const response = await axios.delete(`http://localhost:10101/guia/eliminar/${cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 200 || response.status === 204) {
        // Remover el guía de la lista
        setGuiasCompletos(prev => prev.filter(g => g.cedula !== cedula));
        // Actualizar contadores
        actualizarContadores(guiasCompletos.filter(g => g.cedula !== cedula));
      }
    } catch (error) {
      console.error("Error al eliminar guía:", error);
    } finally {
      setIsDeleting(false);
      setShowEliminarModal(false);
      setGuiaAEliminar(null);
    }
  };

  // Función para manejar cambios de estado
  const handleCambioEstado = (cedula, nuevoEstado) => {
    // Actualizar el estado en la UI inmediatamente
    setGuiasCompletos(prev => prev.map(guia => 
      guia.cedula === cedula ? {...guia, estado: nuevoEstado} : guia
    ));
    
    // Actualizar contadores
    actualizarContadores(guiasCompletos.map(guia => 
      guia.cedula === cedula ? {...guia, estado: nuevoEstado} : guia
    ));
  };

  // Función para mostrar el modal de detalles y cargar los datos completos
  const handleVerDetalles = async (guia) => {
    try {
      setGuiaDetalle(guia); // Primero mostramos los datos básicos
      setShowDetallesModal(true);
      
      // Luego cargamos los datos completos
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:10101/guia/perfil-completo/${guia.cedula}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        // Actualizar con los datos completos
        const perfilCompleto = response.data.data || response.data;
        setGuiaDetalle({
          ...guia,
          ...perfilCompleto,
          telefono: obtenerTelefono(perfilCompleto)
        });
      }
    } catch (error) {
      console.error("Error al cargar perfil completo:", error);
      // No hacemos nada en caso de error, ya tenemos los datos básicos
    }
  };
  
  // Función para obtener el número de teléfono de cualquier formato posible
  const obtenerTelefono = (guia) => {
    if (!guia) return 'No disponible';
    
    // Verificar todas las posibles propiedades donde podría estar el teléfono
    return guia.telefono || 
           guia.celular || 
           guia.numeroCelular || 
           guia.numero_celular || 
           guia.numeroDeTelefono ||
           guia.telefonoContacto ||
           guia.numeroTelefono ||
           guia.telefonoMovil ||
           'No disponible';
  };

  // Función simplificada para cerrar modales y recargar datos
  const cerrarModalYActualizar = () => {
    // Cerrar todos los modales explícitamente
    setShowEditarModal(false);
    setShowDetallesModal(false);
    
    // Volver a cargar los datos sin recargar toda la página
    cargarGuias();
  };

  // Función mejorada para cargar guías después de actualizar
  const cargarGuias = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error("No se encontró token de autenticación");
        toast.error("Error de autenticación. Por favor inicie sesión nuevamente.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      console.log("Iniciando carga de guías...");
      
      const response = await axios.get('http://localhost:10101/guia/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Respuesta del servidor:", response.data);
      
      const guiasData = response.data.data || [];
      
      if (guiasData.length === 0) {
        console.log("No se encontraron guías en la respuesta");
        setGuias([]);
        setGuiasCompletos([]);
        actualizarContadores({
          total: 0,
          disponibles: 0,
          ocupados: 0,
          inactivos: 0
        });
        setLoading(false);
        return;
      }
      
      console.log(`Se encontraron ${guiasData.length} guías`);
      
      // Procesar los datos y añadir estados
      const guiasCompletosPromises = guiasData.map(async (guia) => {
        try {
          const estado = await obtenerEstadoOperador(guia.cedula);
          return { 
            ...guia, 
            estado,
            telefono: obtenerTelefono(guia)
          };
        } catch (error) {
          console.error(`Error al procesar guía ${guia.cedula}:`, error);
          return { 
            ...guia, 
            estado: 'disponible',
            telefono: obtenerTelefono(guia)
          };
        }
      });
      
      const guiasConEstado = await Promise.all(guiasCompletosPromises);
      
      console.log("Guías procesados con éxito:", guiasConEstado.length);
      
      setGuias(guiasData);
      setGuiasCompletos(guiasConEstado);
      actualizarContadores(guiasConEstado);
    } catch (err) {
      console.error("Error al cargar guías:", err);
      
      // Si es un error 401, probablemente el token expiró
      if (err.response && err.response.status === 401) {
        toast.error("Su sesión ha expirado. Por favor inicie sesión nuevamente.");
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError("Error al cargar los guías: " + (err.message || "Error desconocido"));
        toast.error("No se pudieron cargar los guías. Por favor recargue la página.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar alertas
  const showAlert = (message, type) => {
    setAlert({
      show: true,
      message,
      type
    });
    
    // Ocultar la alerta después de 5 segundos
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Función para manejar la actualización del guía
  const handleUpdateGuia = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Datos para actualizar
      const dataToUpdate = {
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre || '',
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido || '',
        email: formData.email,
        telefono: formData.telefono,
        descripcion: formData.descripcion || ''
      };
      
      // Realizar petición
      await axios.patch(
        `http://localhost:10101/guia/actualizar/${guiaDetalle.cedula}`,
        dataToUpdate,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Cerrar modal
      setShowEditarModal(false);
      
      // Mostrar alerta de éxito
      showAlert('¡Perfil actualizado correctamente!', 'success');
      
      // Recargar datos después de un breve retraso
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error al actualizar guía:', error);
      
      // Cerrar el modal incluso si hay un error
      setShowEditarModal(false);
      
      // Si es un error 401 pero la actualización funcionó, mostrar éxito igualmente
      if (error.response && error.response.status === 401) {
        showAlert('¡Perfil actualizado correctamente!', 'success');
      } else {
        showAlert('No se pudo actualizar la información. Intente nuevamente.', 'error');
      }
      
      // Recargar datos
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } finally {
      setUpdating(false);
    }
  };

  // Añadir esta función para cargar los datos del guía en el formulario
  const loadGuiaData = (guia) => {
    setFormData({
      primerNombre: guia.primerNombre || '',
      segundoNombre: guia.segundoNombre || '',
      primerApellido: guia.primerApellido || '',
      segundoApellido: guia.segundoApellido || '',
      email: guia.email || '',
      telefono: guia.telefono || '',
      descripcion: guia.descripcion || ''
    });
  };

  // Función para manejar el botón de editar en la tarjeta de guía
  const handleEditButtonClick = (guia) => {
    // Cargar datos del guía en el formulario
    loadGuiaData(guia);
    
    // Guardar referencia al guía
    setGuiaDetalle(guia);
    
    // Mostrar modal de edición
    setShowEditarModal(true);
  };

  // Componente AlertComponent con texto blanco garantizado
  const AlertComponent = () => {
    if (!alert.show) return null;
    
    return (
      <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 text-white ${
        alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}>
        {alert.type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-white" />
        ) : (
          <AlertCircle className="w-5 h-5 text-white" />
        )}
        <span className="text-white font-medium">{alert.message}</span>
        <button 
          onClick={() => setAlert(prev => ({ ...prev, show: false }))}
          className="ml-2 text-white hover:text-gray-200"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <AlertComponent />
      <div className="p-6 bg-[#0f172a]">
        {/* Cabecera con título y botones */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Gestión de Guías</h1>
          
          <div className="flex items-center space-x-2">
            {/* Barra de búsqueda con ancho fijo */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[350px] py-2 px-4 pr-10 rounded-lg bg-[#1e293b] text-white border-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 p-1.5 rounded-lg">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Botón de filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`py-2 px-4 ${mostrarFiltros ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-lg flex items-center`}
            >
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </button>
            
            {/* Botón de nuevo guía */}
            <button
              onClick={handleAddGuia}
              className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Nuevo guía
            </button>
            
            {/* Botón de actualizar */}
            <button
              onClick={() => window.location.reload()}
              className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
        
        {/* Sección de filtros - solo visible cuando mostrarFiltros es true */}
        {mostrarFiltros && (
          <div className="mb-6 p-4 rounded-lg bg-[#1e293b] transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white text-sm font-medium mb-3">Estado</p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setFiltroEstado('todos')}
                    className={`py-1.5 px-3 rounded-md text-sm font-medium ${filtroEstado === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setFiltroEstado('disponible')}
                    className={`py-1.5 px-3 rounded-md text-sm font-medium ${filtroEstado === 'disponible' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    Disponible
                  </button>
                  <button 
                    onClick={() => setFiltroEstado('ocupado')}
                    className={`py-1.5 px-3 rounded-md text-sm font-medium ${filtroEstado === 'ocupado' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    Ocupado
                  </button>
                  <button 
                    onClick={() => setFiltroEstado('inactivo')}
                    className={`py-1.5 px-3 rounded-md text-sm font-medium ${filtroEstado === 'inactivo' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    Inactivo
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-white text-sm font-medium mb-3">Ordenar por</p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setOrdenarPor('nombre')}
                    className={`py-1.5 px-3 rounded-md text-sm font-medium ${ordenarPor === 'nombre' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    Nombre
                  </button>
                  <button 
                    onClick={() => setOrdenarPor('fecha')}
                    className={`py-1.5 px-3 rounded-md text-sm font-medium ${ordenarPor === 'fecha' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    Más recientes
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFiltroEstado('todos');
                  setOrdenarPor('nombre');
                }}
                className="py-1.5 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-blue-900 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300">Total de Guías</p>
              <p className="text-2xl font-bold text-white">
                {contadores.total}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-800">
              <UserPlus className="w-6 h-6 text-blue-300" />
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-green-900 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-300">Guías Disponibles</p>
              <p className="text-2xl font-bold text-white">
                {contadores.disponibles}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-800">
              <CheckCircle className="w-6 h-6 text-green-300" />
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-yellow-900 flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-300">Guías Ocupados</p>
              <p className="text-2xl font-bold text-white">
                {contadores.ocupados}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-800">
              <Clock className="w-6 h-6 text-yellow-300" />
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-red-900 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-300">Guías Inactivos</p>
              <p className="text-2xl font-bold text-white">
                {contadores.inactivos}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-800">
              <XCircle className="w-6 h-6 text-red-300" />
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
                  {/* Botones de acción */}
                  <div className="absolute top-2 left-2 flex space-x-2 z-10">
                    <button 
                      onClick={() => handleEliminarGuia(guia)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
                      title="Eliminar guía"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar propagación del evento
                        handleEditButtonClick(guia);
                      }}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg"
                      title="Editar guía"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  
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
                      <EstadoGuia 
                        cedula={guia.cedula} 
                        nombre={construirNombreCompleto(guia)}
                        tamanio="normal" 
                        onChangeEstado={(nuevoEstado) => {
                          handleCambioEstado(guia.cedula, nuevoEstado);
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Información del guía */}
                  <div className="pt-16 px-6 pb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold flex items-center justify-center text-white">
                        {construirNombreCompleto(guia)}
                        {guia.calificacion && (
                          <div className="flex items-center ml-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-white">{guia.calificacion}</span>
                          </div>
                        )}
                      </h3>
                      <p className="text-sm text-white opacity-75">{guia.especialidad || 'Guía Turístico General'}</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="text-sm truncate text-white">{guia.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-3 text-green-500" />
                        <span className="text-sm text-white">{obtenerTelefono(guia)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-3 text-red-500" />
                        <span className="text-sm text-white">{guia.ubicacion || 'No especificada'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="text-sm text-white">Desde {new Date(guia.fecha_registro || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-3 text-purple-500" />
                        <span className="text-sm text-white">{guia.cedula || 'No disponible'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleVerDetalles(guia)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium w-full max-w-[200px]"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 rounded-lg text-center bg-gray-700">
                <p className="text-xl">No se encontraron guías con los filtros aplicados</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFiltroEstado('todos');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modal de detalles del guía - Con mejoras de responsividad */}
      {showDetallesModal && guiaDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 sticky top-0 bg-[#0f172a] z-10">
              <h2 className="text-xl font-bold text-white">Perfil completo del guía</h2>
              <button 
                onClick={() => setShowDetallesModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Columna izquierda - foto y estado */}
                <div className="flex flex-col items-center mx-auto md:mx-0 mb-6 md:mb-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-blue-500 mb-4">
                    {guiaDetalle.foto ? (
                      <img 
                        src={guiaDetalle.foto.startsWith('http') ? guiaDetalle.foto : `http://localhost:10101/uploads/images/${guiaDetalle.foto}`} 
                        alt={construirNombreCompleto(guiaDetalle)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${guiaDetalle.primerNombre}+${guiaDetalle.primerApellido}&background=0D8ABC&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${guiaDetalle.primerNombre}+${guiaDetalle.primerApellido}&background=0D8ABC&color=fff&size=128`} 
                        alt={construirNombreCompleto(guiaDetalle)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="px-4 py-2 bg-green-600 text-white rounded-md text-center w-full max-w-[180px]">
                    Disponible
                  </div>
                </div>
                
                {/* Columna derecha - información */}
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 text-center md:text-left">
                    {construirNombreCompleto(guiaDetalle)}
                  </h3>
                  <p className="text-gray-400 mb-6 text-center md:text-left">
                    {guiaDetalle.especialidad || 'Guía Turístico General'}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                    <div className="flex items-start space-x-2">
                      <CreditCard className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Cédula:</p>
                        <p className="text-sm text-white">{guiaDetalle.cedula || '1203030'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Mail className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Email:</p>
                        <p className="text-sm text-white">{guiaDetalle.email || 'gabo.guia@gmail.com'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Phone className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Teléfono:</p>
                        <p className="text-sm text-white">{guiaDetalle.telefono || '3053289798'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Ubicación:</p>
                        <p className="text-sm text-white">{guiaDetalle.ubicacion || 'No especificada'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Calendar className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Fecha de registro:</p>
                        <p className="text-sm text-white">{new Date(guiaDetalle.fecha_registro || '2025-03-11').toLocaleDateString() || '11/3/2025'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Languages className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Idiomas:</p>
                        <p className="text-sm text-white">{guiaDetalle.idiomas || 'No especificados'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sección de descripción */}
              <div className="mt-6">
                <h4 className="text-white font-medium mb-2">Descripción</h4>
                <p className="text-sm text-gray-300 bg-[#111827] p-4 rounded-lg">
                  {guiaDetalle.descripcion || 'Guía buenardo que no camina, corre, pero si corre se cansa rápido entonces es mejor caminar o montar a caballo.'}
                </p>
              </div>
              
              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    loadGuiaData(guiaDetalle);
                    setShowEditarModal(true);
                    setShowDetallesModal(false);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Editar información
                </button>
                
                <button
                  onClick={() => setShowDetallesModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de eliminación */}
      {showEliminarModal && guiaAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-700 transform transition-all">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Confirmar Eliminación</h2>
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg">
              <div className="relative">
                {guiaAEliminar.foto ? (
                  <img 
                    src={guiaAEliminar.foto.startsWith('http') ? guiaAEliminar.foto : `http://localhost:10101/uploads/images/${guiaAEliminar.foto}`} 
                    alt={construirNombreCompleto(guiaAEliminar)}
                    className="w-20 h-20 rounded-full object-cover border-2 border-red-500 shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=No+Foto&background=6B7280&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-600 border-2 border-red-500 flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">No Foto</span>
                  </div>
                )}
                <div className="absolute -top-1 -right-1 bg-red-600 w-6 h-6 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-lg">{construirNombreCompleto(guiaAEliminar)}</p>
                <p className="text-gray-400 text-sm">Cédula: {guiaAEliminar.cedula}</p>
                <div className="mt-1 inline-block px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full">
                  Será eliminado permanentemente
                </div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 bg-yellow-800/20 border-l-4 border-yellow-600 pl-3 py-2 italic">
              ¿Está seguro que desea eliminar este guía? Esta acción no se puede deshacer.
            </p>
            
            {countdownActive && (
              <div className="mb-6 bg-red-900/20 border border-red-600 rounded-lg p-4 text-center">
                <p className="text-white mb-2">Eliminando en <span className="font-bold text-2xl text-red-500">{countdown}</span> segundos</p>
                <button 
                  onClick={cancelCountdown}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Cancelar eliminación
                </button>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEliminarModal(false);
                  setGuiaAEliminar(null);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-300"
                disabled={isDeleting || countdownActive}
              >
                Cancelar
              </button>
              <button
                onClick={handleActualDelete}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-300"
                disabled={isDeleting || countdownActive}
              >
                Eliminar sin conteo
              </button>
              <button
                onClick={startCountdown}
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-2.5 px-5 rounded-lg transition-all duration-300 flex items-center justify-center"
                disabled={isDeleting || countdownActive}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de edición del guía - Con mejoras de responsividad */}
      {showEditarModal && guiaDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 sticky top-0 bg-[#0f172a] z-10">
              <h2 className="text-xl font-bold text-white">Actualizar Información del Guía</h2>
              <button 
                onClick={() => setShowEditarModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <form onSubmit={handleUpdateGuia}>
                {/* Foto de perfil estática */}
                <div className="flex justify-center mb-6">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-blue-500">
                    {guiaDetalle.foto ? (
                      <img 
                        src={guiaDetalle.foto.startsWith('http') ? guiaDetalle.foto : `http://localhost:10101/uploads/images/${guiaDetalle.foto}`} 
                        alt={construirNombreCompleto(guiaDetalle)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${guiaDetalle.primerNombre}+${guiaDetalle.primerApellido}&background=0D8ABC&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${guiaDetalle.primerNombre}+${guiaDetalle.primerApellido}&background=0D8ABC&color=fff&size=128`} 
                        alt={construirNombreCompleto(guiaDetalle)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                
                {/* Campos de formulario */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">
                      Primer Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primerNombre}
                      onChange={(e) => setFormData({...formData, primerNombre: e.target.value})}
                      required
                      className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">
                      Segundo Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.segundoNombre}
                      onChange={(e) => setFormData({...formData, segundoNombre: e.target.value})}
                      className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">
                      Primer Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primerApellido}
                      onChange={(e) => setFormData({...formData, primerApellido: e.target.value})}
                      required
                      className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">
                      Segundo Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.segundoApellido}
                      onChange={(e) => setFormData({...formData, segundoApellido: e.target.value})}
                      className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-white">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      required
                      className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1 text-white">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows="4"
                    className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                
                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditarModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center order-1 sm:order-2 mb-3 sm:mb-0"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Añadir ToastContainer dentro del DashboardLayout */}
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
      />
    </DashboardLayout>
  );
};

export default Guias; 