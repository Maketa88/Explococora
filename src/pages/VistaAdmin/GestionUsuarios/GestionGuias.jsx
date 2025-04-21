import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DashboardLayoutAdmin from '../../../layouts/DashboardLayoutAdmin';
import { Mail, Phone, MapPin, Calendar, CheckCircle, Clock, XCircle, Search, Filter, UserPlus, Star, CreditCard, Trash2, Edit, Languages, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoExplococora from '../../../assets/Images/logo.webp';
import EstadoGuia from '../../../components/Guias/EstadoGuia';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import CrearGuia from './CrearGuia';

const Guias = () => {
  const navigate = useNavigate();
  const [guiasCompletos, setGuiasCompletos] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [showCrearGuiaModal, setShowCrearGuiaModal] = useState(false);

  // Función para mostrar el modal de Crear Guía en lugar de navegar
  const handleAddGuia = () => {
    setShowCrearGuiaModal(true);
  };

  // Función para cerrar el modal de Crear Guía
  const handleCloseCrearGuiaModal = () => {
    setShowCrearGuiaModal(false);
  };

  // Función para manejar la creación exitosa de un guía
  const handleGuiaCreated = (newGuia) => {
    // Actualizar la lista de guías sin tener que recargar la página
    setGuiasCompletos(prevGuias => [newGuia, ...prevGuias]);
    // Actualizar contadores
    actualizarContadores([newGuia, ...guiasCompletos]);
    // Mostrar notificación de éxito
    toast.success("¡Guía creado exitosamente!");
    // Cerrar el modal
    setShowCrearGuiaModal(false);
    // Recargar la lista de guías para asegurar que todos los datos estén actualizados
    setTimeout(() => {
      cargarGuias();
    }, 1000);
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
      const response = await axios.get(`https://servicio-explococora.onrender.com/usuarios/consultar-estado/cedula/${cedula}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data?.data?.estado || 'disponible';
    } catch (_) {
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
    cargarGuias();
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
      
      const response = await axios.delete(`https://servicio-explococora.onrender.com/guia/eliminar/${cedula}`, {
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
      const response = await axios.get(`https://servicio-explococora.onrender.com/guia/perfil-completo/${guia.cedula}`, {
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

  // Función para cargar guías desde el servidor
  const cargarGuias = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error("No hay token de autenticación");
        setLoading(false);
        return;
      }
      
      // Lista de posibles endpoints para probar
      const endpoints = [
        'https://servicio-explococora.onrender.com/guia/todos',
        'https://servicio-explococora.onrender.com/guias/todos',
        'https://servicio-explococora.onrender.com/operador-turistico/guias'
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
            console.log(`Endpoint exitoso: ${endpoint}`);
            break;
          }
        } catch (err) {
          console.log(`Error en endpoint ${endpoint}:`, err.message);
        }
      }
      
      if (!encontrado) {
        console.error("No se pudo conectar con ningún endpoint");
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
            const perfilResponse = await axios.get(`https://servicio-explococora.onrender.com/guia/perfil-completo/${guia.cedula}`, {
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
          } catch (_) {
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
      
      setGuiasCompletos(guiasConEstado);
      actualizarContadores(guiasConEstado);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar guías:", err);
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
    
    // Ocultar la alerta después de un tiempo
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, type === 'success' ? 5000 : 4000); // 5 segundos para éxito, 4 para error
  };

  // Función para manejar la actualización del guía
  const handleUpdateGuia = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('Error de autenticación. Por favor inicie sesión nuevamente.', 'error');
        setUpdating(false);
        return;
      }

      // Preparar datos para actualizar - IGUAL QUE EN EDITAR GUIA
      const datosActualizar = {
        primerNombre: formData.primerNombre,
        segundoNombre: formData.segundoNombre || '',
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido || '',
        email: formData.email,
        numeroCelular: formData.telefono,
        telefono: formData.telefono, // Enviar en ambos campos para asegurarnos
        descripcion: formData.descripcion || ''
      };
      
      console.log("DATOS QUE SE ENVIARÁN PARA ACTUALIZAR:", datosActualizar);
      
      // Realizar la actualización principal como en EditarGuia.jsx
      const response = await axios.patch(
        `https://servicio-explococora.onrender.com/guia/actualizar/${guiaDetalle.cedula}`,
        datosActualizar,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Respuesta de actualización:", response.data);

      // Actualizar específicamente el teléfono en la tabla de teléfonos
      try {
        console.log("Actualizando teléfono específicamente...");
        const telefonoResponse = await axios.post(
          `https://servicio-explococora.onrender.com/guia/telefono/${guiaDetalle.cedula}`,
          { numeroCelular: formData.telefono },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Teléfono actualizado específicamente:", telefonoResponse.data);
      } catch (telefonoError) {
        console.error("Error al actualizar teléfono específicamente:", telefonoError);
        // No interrumpimos el flujo, continuamos con la actualización general
      }

      // Cerrar modal
      setShowEditarModal(false);
      
      // Mostrar alerta de éxito
      showAlert('¡Perfil actualizado correctamente!', 'success');
      
      // Actualizar datos sin recargar la página
      setGuiaDetalle({...guiaDetalle, ...datosActualizar});
      setTimeout(() => {
        cargarGuias();
      }, 1000);
      
    } catch (error) {
      console.error('Error al actualizar guía:', error);
      showAlert(`Error: ${error.response?.data?.message || 'No se pudo actualizar el guía'}`, 'error');
      setShowEditarModal(false);
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

  return (
    <DashboardLayoutAdmin>
      <AlertComponent />
      {/* Render the CrearGuia modal conditionally */}
      {showCrearGuiaModal && (
        <CrearGuia 
          onClose={handleCloseCrearGuiaModal} 
          onGuiaCreated={handleGuiaCreated}
        />
      )}
      <div className="p-6 bg-white">
        {/* Cabecera con título y botones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Guías</h1>
          
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
                onClick={handleAddGuia}
                className="py-2 px-4 flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Nuevo guía
              </button>
            </div>
          </div>
        </div>
        
        {/* Sección de filtros - solo visible cuando mostrarFiltros es true */}
        {mostrarFiltros && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-white to-emerald-50 border border-emerald-100 shadow-lg transition-all duration-300 ease-in-out animate-fadeIn">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="w-full lg:w-auto">
                <p className="text-gray-800 text-sm font-medium mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Estado
                </p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => {
                      setFiltroEstado('todos'); 
                      document.getElementById('filtroTodos').classList.add('animate-pulse');
                      setTimeout(() => document.getElementById('filtroTodos').classList.remove('animate-pulse'), 500);
                    }}
                    id="filtroTodos"
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 transform hover:shadow-md ${filtroEstado === 'todos' ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => {
                      setFiltroEstado('disponible');
                      document.getElementById('filtroDisponible').classList.add('animate-pulse');
                      setTimeout(() => document.getElementById('filtroDisponible').classList.remove('animate-pulse'), 500);
                    }}
                    id="filtroDisponible"
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 transform hover:shadow-md ${filtroEstado === 'disponible' ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-white text-gray-700 border border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600'}`}
                  >
                    Disponible
                  </button>
                  <button 
                    onClick={() => {
                      setFiltroEstado('ocupado');
                      document.getElementById('filtroOcupado').classList.add('animate-pulse');
                      setTimeout(() => document.getElementById('filtroOcupado').classList.remove('animate-pulse'), 500);
                    }}
                    id="filtroOcupado"
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 transform hover:shadow-md ${filtroEstado === 'ocupado' ? 'bg-amber-500 text-white shadow-md scale-105' : 'bg-white text-gray-700 border border-gray-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600'}`}
                  >
                    Ocupado
                  </button>
                  <button 
                    onClick={() => {
                      setFiltroEstado('inactivo');
                      document.getElementById('filtroInactivo').classList.add('animate-pulse');
                      setTimeout(() => document.getElementById('filtroInactivo').classList.remove('animate-pulse'), 500);
                    }}
                    id="filtroInactivo"
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 transform hover:shadow-md ${filtroEstado === 'inactivo' ? 'bg-gray-500 text-white shadow-md scale-105' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                  >
                    Inactivo
                  </button>
                </div>
              </div>
              
              <div className="w-full lg:w-auto">
                <p className="text-gray-800 text-sm font-medium mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-emerald-500" /> Ordenar por
                </p>
                <div className="p-1 bg-gray-100 rounded-full inline-flex">
                  <button 
                    onClick={() => {
                      setOrdenarPor('nombre');
                      document.getElementById('ordenNombre').classList.add('animate-pulse');
                      setTimeout(() => document.getElementById('ordenNombre').classList.remove('animate-pulse'), 500);
                    }}
                    id="ordenNombre"
                    className={`py-1.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${ordenarPor === 'nombre' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-700 hover:text-emerald-600'}`}
                  >
                    Nombre
                  </button>
                  <button 
                    onClick={() => {
                      setOrdenarPor('fecha');
                      document.getElementById('ordenFecha').classList.add('animate-pulse');
                      setTimeout(() => document.getElementById('ordenFecha').classList.remove('animate-pulse'), 500);
                    }}
                    id="ordenFecha"
                    className={`py-1.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${ordenarPor === 'fecha' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-700 hover:text-emerald-600'}`}
                  >
                    Recientes
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFiltroEstado('todos');
                  setOrdenarPor('nombre');
                  document.getElementById('limpiarFiltros').classList.add('animate-pulse');
                  setTimeout(() => document.getElementById('limpiarFiltros').classList.remove('animate-pulse'), 500);
                }}
                id="limpiarFiltros"
                className="py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200 shadow hover:shadow-md transition-all duration-300 flex items-center mt-4 lg:mt-0"
              >
                <X className="w-4 h-4 mr-2 text-gray-500" /> Limpiar filtros
              </button>
            </div>
          </div>
        )}
        
        
        {/* Lista de guías - sin efectos de zoom */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            <div className="col-span-full p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg text-gray-700">Cargando guías...</p>
            </div>
          ) : guiasFiltrados().length > 0 ? (
            guiasFiltrados().map((guia) => (
              <div 
                key={guia.id || guia.cedula} 
                className="rounded-lg shadow-lg overflow-hidden bg-white relative group"
              >
                {/* Botones de acción - ahora siempre visibles */}
                <div className="absolute top-2 left-2 flex space-x-2 z-10">
                  <button 
                    onClick={() => handleEliminarGuia(guia)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                    title="Eliminar guía"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditButtonClick(guia);
                    }}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg"
                    title="Editar guía"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Cabecera con imagen - sin efectos de transformación */}
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
                      {/* Imagen sin efectos de transformación */}
                      {guia.foto ? (
                        <img 
                          src={guia.foto.startsWith('http') ? guia.foto : `https://servicio-explococora.onrender.com/uploads/images/${guia.foto}`} 
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
                  <div className="absolute top-2 right-2 z-10">
                    <EstadoGuia 
                      cedula={guia.cedula} 
                      nombre={construirNombreCompleto(guia)}
                      tamanio="normal" 
                      onChangeEstado={(nuevoEstado) => {
                        handleCambioEstado(guia.cedula, nuevoEstado);
                      }}
                      colorDisponible="bg-green-100 text-green-600"
                      colorOcupado="bg-amber-100 text-amber-600"
                      colorInactivo="bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
                
                {/* Información del guía - sin efectos de escala */}
                <div className="pt-16 px-4 sm:px-6 pb-4 sm:pb-6 bg-gradient-to-b from-white to-emerald-50/50">
                  <div className="text-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center justify-center text-gray-800">
                      {construirNombreCompleto(guia)}
                      {guia.calificacion && (
                        <div className="flex items-center ml-2">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-gray-700">{guia.calificacion}</span>
                        </div>
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-600 font-medium">{guia.especialidad || 'Guía Turístico General'}</p>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center p-2 rounded-md hover:bg-emerald-100 transition-colors duration-200">
                      <Mail className="w-4 h-4 mr-2 sm:mr-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate text-gray-700">{guia.email}</span>
                    </div>
                    <div className="flex items-center p-2 rounded-md hover:bg-emerald-100 transition-colors duration-200">
                      <Phone className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">{obtenerTelefono(guia)}</span>
                    </div>
                    <div className="flex items-center p-2 rounded-md hover:bg-emerald-100 transition-colors duration-200">
                      <MapPin className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">{guia.ubicacion || 'No especificada'}</span>
                    </div>
                    <div className="flex items-center p-2 rounded-md hover:bg-emerald-100 transition-colors duration-200">
                      <Calendar className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">Desde {new Date(guia.fecha_registro || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center p-2 rounded-md hover:bg-emerald-100 transition-colors duration-200">
                      <CreditCard className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">{guia.cedula || 'No disponible'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button 
                      onClick={() => handleVerDetalles(guia)}
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
            <div className="col-span-full p-4 sm:p-8 rounded-lg text-center bg-gray-200">
              <p className="text-lg sm:text-xl">No se encontraron guías disponibles</p>
              <button 
                onClick={() => {
                  cargarGuias();
                }}
                className="mt-3 sm:mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
              >
                Cargar guías
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de detalles del guía - Con encabezado verde y botón de cierre */}
      {showDetallesModal && guiaDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Encabezado verde con botón de cierre */}
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-emerald-100 sticky top-0 bg-emerald-600 z-10 rounded-t-lg">
              <h2 className="text-lg sm:text-xl font-bold text-white">Perfil completo del guía</h2>
              <button 
                onClick={() => setShowDetallesModal(false)}
                className="text-white hover:text-gray-200 bg-emerald-700 hover:bg-emerald-800 rounded-full p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-3 sm:p-6 bg-emerald-50/30">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* Columna izquierda - foto y estado */}
                <div className="flex flex-col items-center mx-auto md:mx-0 mb-6 md:mb-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-emerald-500 mb-4">
                    {guiaDetalle.foto ? (
                      <img 
                        src={guiaDetalle.foto.startsWith('http') ? guiaDetalle.foto : `https://servicio-explococora.onrender.com/uploads/images/${guiaDetalle.foto}`} 
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
                  
                  <div className="px-4 py-2 bg-emerald-500 text-white rounded-md text-center w-full max-w-[180px]">
                    Disponible
                  </div>
                </div>
                
                {/* Columna derecha - información */}
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 text-center md:text-left">
                    {construirNombreCompleto(guiaDetalle)}
                  </h3>
                  <p className="text-gray-500 mb-6 text-center md:text-left">
                    {guiaDetalle.especialidad || 'Guía Turístico General'}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                    <div className="flex items-start space-x-2">
                      <CreditCard className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                        <p className="text-xs text-gray-500">Cédula:</p>
                        <p className="text-sm text-gray-800">{guiaDetalle.cedula || '1203030'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Mail className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                        <p className="text-xs text-gray-500">Email:</p>
                        <p className="text-sm text-gray-800">{guiaDetalle.email || 'gabo.guia@gmail.com'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Phone className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                        <p className="text-xs text-gray-500">Teléfono:</p>
                        <p className="text-sm text-gray-800">{guiaDetalle.telefono || '3053289798'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                        <p className="text-xs text-gray-500">Ubicación:</p>
                        <p className="text-sm text-gray-800">{guiaDetalle.ubicacion || 'No especificada'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Calendar className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                        <p className="text-xs text-gray-500">Fecha de registro:</p>
                        <p className="text-sm text-gray-800">{new Date(guiaDetalle.fecha_registro || '2025-03-11').toLocaleDateString() || '11/3/2025'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Languages className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                        <p className="text-xs text-gray-500">Idiomas:</p>
                        <p className="text-sm text-gray-800">{guiaDetalle.idiomas || 'No especificados'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sección de descripción */}
              <div className="mt-6">
                <h4 className="text-gray-800 font-medium mb-2">Descripción</h4>
                <p className="text-sm text-gray-700 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
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
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md"
                >
                  Editar información
                </button>
                
                <button
                  onClick={() => setShowDetallesModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
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
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-0">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-2xl border border-gray-200 transform transition-all m-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 border-b border-emerald-100 pb-2 bg-emerald-50 p-2 sm:p-3 -mt-4 -mx-4 sm:-mx-6 rounded-t-lg">Confirmar Eliminación</h2>
            <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="relative">
                {guiaAEliminar.foto ? (
                  <img 
                    src={guiaAEliminar.foto.startsWith('http') ? guiaAEliminar.foto : `https://servicio-explococora.onrender.com/uploads/images/${guiaAEliminar.foto}`} 
                    alt={construirNombreCompleto(guiaAEliminar)}
                    className="w-20 h-20 rounded-full object-cover border-2 border-red-500 shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=No+Foto&background=6B7280&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-red-500 flex items-center justify-center shadow-lg">
                    <span className="text-gray-800 text-sm">No Foto</span>
                  </div>
                )}
                <div className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-gray-800 font-bold text-lg">{construirNombreCompleto(guiaAEliminar)}</p>
                <p className="text-gray-500 text-sm">Cédula: {guiaAEliminar.cedula}</p>
                <div className="mt-1 inline-block px-2 py-1 bg-red-100 text-red-500 text-xs rounded-full">
                  Será eliminado permanentemente
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-6 bg-emerald-50 border-l-4 border-emerald-500 pl-3 py-2 italic">
              ¿Está seguro que desea eliminar este guía? Esta acción no se puede deshacer.
            </p>
            
            {countdownActive && (
              <div className="mb-6 bg-red-100 border border-red-500 rounded-lg p-4 text-center">
                <p className="text-gray-800 mb-2">Eliminando en <span className="font-bold text-2xl text-red-500">{countdown}</span> segundos</p>
                <button 
                  onClick={cancelCountdown}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Cancelar eliminación
                </button>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowEliminarModal(false);
                  setGuiaAEliminar(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-5 rounded-lg transition-all duration-300"
                disabled={isDeleting || countdownActive}
              >
                Cancelar
              </button>
              <button
                onClick={handleActualDelete}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-300"
                disabled={isDeleting || countdownActive}
              >
                Eliminar sin conteo
              </button>
              <button
                onClick={startCountdown}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2.5 px-5 rounded-lg transition-all duration-300 flex items-center justify-center"
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
      
      {/* Modal de edición del guía - Con botón X para cerrar */}
      {showEditarModal && guiaDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Encabezado verde con botón X para cerrar */}
            <div className="flex justify-between items-center p-4 sm:p-6 bg-emerald-600 rounded-t-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Actualizar Información</h2>
              <button 
                onClick={() => setShowEditarModal(false)}
                className="text-white hover:text-gray-200 bg-emerald-700 hover:bg-emerald-800 rounded-full p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <form onSubmit={handleUpdateGuia}>
                {/* Foto de perfil centrada */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                      {guiaDetalle.foto ? (
                        <img 
                          src={guiaDetalle.foto.startsWith('http') ? guiaDetalle.foto : `https://servicio-explococora.onrender.com/uploads/images/${guiaDetalle.foto}`} 
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
                    <button 
                      type="button"
                      className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full shadow-md hover:bg-emerald-600 transition-colors"
                      title="Cambiar foto"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-center text-gray-500 text-sm mb-6">Haz clic en el ícono de lápiz para cambiar la foto</p>
                
                {/* Campos de formulario en grid responsivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Primer Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primerNombre}
                      onChange={(e) => setFormData({...formData, primerNombre: e.target.value})}
                      required
                      className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Primer nombre"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Segundo Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.segundoNombre}
                      onChange={(e) => setFormData({...formData, segundoNombre: e.target.value})}
                      className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Segundo nombre (opcional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Primer Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primerApellido}
                      onChange={(e) => setFormData({...formData, primerApellido: e.target.value})}
                      required
                      className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Primer apellido"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Segundo Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.segundoApellido}
                      onChange={(e) => setFormData({...formData, segundoApellido: e.target.value})}
                      className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Segundo apellido (opcional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      required
                      className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Número de teléfono"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows="4"
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Breve descripción del guía..."
                  ></textarea>
                </div>
                
                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowEditarModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md flex items-center justify-center order-1 sm:order-2 mb-3 sm:mb-0"
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
      
      {/* Añadir ToastContainer dentro del DashboardLayoutAdmin */}
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
    </DashboardLayoutAdmin>
  );
};

export default Guias;

<style jsx="true">{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .animate-pulse {
    animation: pulse 0.5s ease-in-out;
  }
`}</style> 
