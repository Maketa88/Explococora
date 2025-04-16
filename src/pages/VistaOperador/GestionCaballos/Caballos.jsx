import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaHorse, FaSearch, FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { MdFilterList } from 'react-icons/md';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Caballos = () => {
  const navigate = useNavigate();
  // Estados para manejar los datos y la UI
  const [caballos, setCaballos] = useState([]);
  const [caballoSeleccionado, setCaballoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState(false);
  const [filtros, setFiltros] = useState({
    colorEstado: 'todos',
  });
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    serialCaballo: '',
    estadoSalud: 'Óptimas condiciones',
  });

  const [apiRespuesta, setApiRespuesta] = useState(null);

  // Función mejorada para mostrar alertas con SweetAlert
  const showAlert = (message, type, details = null) => {
    let title = type === 'success' ? '¡Éxito!' : 'Error';
    let timer = type === 'success' ? 3000 : 0; // Sin timer para errores para que el usuario pueda leer
    
    const options = {
      title: title,
      text: message,
      icon: type,
      confirmButtonColor: '#059669', // emerald-600
      timerProgressBar: timer > 0,
      toast: type === 'success', // Solo los éxitos como toast
      position: type === 'success' ? 'top-end' : 'center',
      showConfirmButton: type !== 'success',
    };
    
    if (timer > 0) {
      options.timer = timer;
    }
    
    // Si hay detalles adicionales, añadirlos como footer
    if (details) {
      options.footer = `<div class="text-xs text-gray-500">${details}</div>`;
    }
    
    Swal.fire(options);
  };

  // Función para cargar todos los caballos con mensajes de error mejorados
  const cargarCaballos = useCallback(async () => {
    setCargando(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('No hay token de autenticación. Por favor, inicie sesión nuevamente.', 'error');
        setCargando(false);
        return;
      }
      
      // Verificar si el token existe
      try {
        const [header, payload, signature] = token.split('.');
        const decodedPayload = JSON.parse(atob(payload));
        
        // Comprobar si el token está expirado
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
          showAlert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error', 
                    'El token de autenticación ha caducado.');
          setCargando(false);
          return;
        }
      } catch (e) {
        console.error('Error al decodificar token:', e);
      }
      
      const response = await axios.get('http://localhost:10101/caballo/todos', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Debug-Role': 'admin'
        }
      });
      
      if (response.data.data && Array.isArray(response.data.data)) {
        // Ordenar los caballos por serial al cargarlos
        const caballosOrdenados = [...response.data.data].sort((a, b) => {
          const serialA = a.serialCaballo || '';
          const serialB = b.serialCaballo || '';
          
          // Verificar si ambos son números puros para ordenamiento numérico
          const isNumericA = /^\d+$/.test(serialA);
          const isNumericB = /^\d+$/.test(serialB);
          
          if (isNumericA && isNumericB) {
            // Si ambos son números, convertir para ordenamiento numérico
            return parseInt(serialA, 10) - parseInt(serialB, 10);
          }
          
          // Si hay seriales alfanuméricos, usar ordenamiento alfabético con soporte numérico
          return serialA.localeCompare(serialB, undefined, {numeric: true, sensitivity: 'base'});
        });
        
        setCaballos(caballosOrdenados);
      } else if (response.data && Array.isArray(response.data)) {
        // Si la data está directamente en response.data
        const caballosOrdenados = [...response.data].sort((a, b) => {
          const serialA = a.serialCaballo || '';
          const serialB = b.serialCaballo || '';
          return serialA.localeCompare(serialB, undefined, {numeric: true, sensitivity: 'base'});
        });
        
        setCaballos(caballosOrdenados);
      } else {
        // En caso que la API devuelva los datos en otro formato
        console.warn('Formato de datos inesperado:', response.data);
        setCaballos([]);
      }
    } catch (error) {
      console.error('Error al cargar caballos:', error);
      
      let mensaje = 'Error al cargar los caballos';
      let detalle = error.message || '';
      
      if (error.response) {
        // La solicitud fue realizada y el servidor respondió con un código de error
        const status = error.response.status;
        
        if (status === 401) {
          mensaje = 'Sesión expirada o no válida';
          detalle = 'Por favor, vuelve a iniciar sesión para acceder a esta información.';
        } else if (status === 403) {
          mensaje = 'No tienes permisos para acceder a esta funcionalidad';
          detalle = 'Tu rol actual podría no ser compatible. Roles permitidos: admin, Operador, Guía.';
        } else if (status === 404) {
          mensaje = 'No se encontraron datos de caballos';
          detalle = 'El recurso solicitado no existe o ha sido movido.';
        } else if (status >= 500) {
          mensaje = 'Error en el servidor';
          detalle = `Error ${status}: El servidor no pudo procesar la solicitud.`;
        }
        
        if (error.response.data && error.response.data.mensaje) {
          detalle = error.response.data.mensaje;
        }
      } else if (error.request) {
        // La solicitud fue realizada pero no se recibió respuesta
        mensaje = 'No se pudo conectar con el servidor';
        detalle = 'Verifica tu conexión a internet o contacta al administrador del sistema.';
      }
      
      setError(`${mensaje}. ${detalle}`);
      showAlert(mensaje, 'error', detalle);
    } finally {
      setCargando(false);
    }
  }, []);

  // Cargar caballos al montar el componente
  useEffect(() => {
    cargarCaballos();
  }, [cargarCaballos]);

  // Función para abrir modal de creación/edición
  const abrirModal = (caballo = null) => {
    console.log('Abriendo modal para:', caballo ? 'Editar' : 'Crear nuevo', 'caballo');
    
    if (caballo) {
      console.log('Datos del caballo a editar:', caballo);
      setCaballoSeleccionado(caballo);
      setFormData({
        serialCaballo: caballo.serialCaballo || '',
        estadoSalud: caballo.estadoSalud || 'Óptimas condiciones',
      });
    } else {
      setCaballoSeleccionado(null);
      setFormData({
        serialCaballo: '',
        estadoSalud: 'Óptimas condiciones', // Valor predeterminado para facilitar al usuario
      });
    }
    setModalAbierto(true);
  };

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para guardar un caballo (crear o actualizar) con mensajes específicos
  const guardarCaballo = async (e) => {
    e.preventDefault();
    
    console.log('Datos del formulario a enviar:', formData);
    
    // Validaciones del lado del cliente
    if (!formData.serialCaballo || formData.serialCaballo.trim() === '') {
      showAlert('El serial del caballo es obligatorio', 'error', 'Por favor ingresa un identificador único para el caballo.');
      return;
    }

    if (!formData.estadoSalud || formData.estadoSalud.trim() === '') {
      showAlert('El estado de salud es obligatorio', 'error', 'Por favor describe la condición actual del caballo.');
      return;
    }
    
    setCargando(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token utilizado para la petición:', token ? 'Token disponible' : 'Token no disponible');
      
      if (!token) {
        showAlert('No hay token de autenticación', 'error', 'Por favor, inicia sesión nuevamente.');
        setCargando(false);
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Cabezeras de la petición:', headers);
      
      if (caballoSeleccionado) {
        // Actualizar caballo existente
        console.log(`Actualizando caballo con serial: ${formData.serialCaballo}`);
        const response = await axios.patch(`http://localhost:10101/caballo/${formData.serialCaballo}`, formData, { headers });
        console.log('Respuesta de actualización:', response.data);
        showAlert(`Caballo ${formData.serialCaballo} actualizado con éxito`, 'success');
      } else {
        // Crear nuevo caballo
        console.log(`Creando nuevo caballo con serial: ${formData.serialCaballo}`);
        try {
          const response = await axios.post('http://localhost:10101/caballo/registrar', formData, { headers });
          console.log('Respuesta de creación:', response.data);
          showAlert(`Caballo ${formData.serialCaballo} registrado con éxito`, 'success');
        } catch (error) {
          console.error('Error específico al crear caballo:', error);
          
          // Manejo especializado para error de serial duplicado
          if (error.response && error.response.status === 409) {
            showAlert(
              `El serial ${formData.serialCaballo} ya está en uso`, 
              'error', 
              'Por favor utiliza un identificador único para cada caballo.'
            );
            setCargando(false);
            return;
          }
          
          // Si la API devuelve una respuesta específica sobre el campo inválido
          if (error.response && error.response.data) {
            console.log('Detalles del error recibidos:', error.response.data);
            
            // Buscar mensajes específicos sobre campos requeridos
            if (error.response.data.errors) {
              const fieldErrors = error.response.data.errors;
              if (fieldErrors.serialCaballo) {
                showAlert('Error en el serial del caballo', 'error', fieldErrors.serialCaballo);
                setCargando(false);
                return;
              }
              if (fieldErrors.estadoSalud) {
                showAlert('Error en el estado de salud', 'error', fieldErrors.estadoSalud);
                setCargando(false);
                return;
              }
            }
          }
          
          // Re-lanzar para que el catch general lo maneje
          throw error;
        }
      }
      
      setModalAbierto(false);
      cargarCaballos();
    } catch (error) {
      console.error('Error al guardar caballo:', error);
      console.log('Respuesta de error:', error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : 'No hay respuesta del servidor');
      
      let mensaje = 'Error al guardar el caballo';
      let detalle = '';
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 400) {
          mensaje = 'Datos inválidos en el formulario';
          
          if (error.response.data && error.response.data.mensaje) {
            detalle = error.response.data.mensaje;
          } else if (error.response.data && error.response.data.error) {
            detalle = error.response.data.error;
          } else {
            detalle = 'Verifica que todos los campos estén completos y sean correctos.';
          }
        } else if (status === 401) {
          mensaje = 'Sesión expirada o no válida';
          detalle = 'Por favor, vuelve a iniciar sesión.';
        } else if (status === 403) {
          mensaje = 'No tienes permisos para realizar esta acción';
          detalle = 'Esta función está limitada a usuarios con rol de Operador.';
        } else if (status === 409) {
          mensaje = 'El serial del caballo ya existe';
          detalle = 'Por favor, utiliza un serial diferente.';
        } else if (status >= 500) {
          mensaje = 'Error en el servidor';
          detalle = `Error ${status}: No se pudo procesar la solicitud.`;
        }
      } else if (error.request) {
        mensaje = 'No se pudo conectar con el servidor';
        detalle = 'Verifica tu conexión a internet.';
      } else {
        detalle = error.message;
      }
      
      showAlert(mensaje, 'error', detalle);
    } finally {
      setCargando(false);
    }
  };

  // Función para confirmar eliminación usando SweetAlert
  const confirmarEliminacion = (caballo) => {
    setCaballoSeleccionado(caballo);
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el caballo con serial ${caballo.serialCaballo}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#059669',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarCaballo(caballo);
      }
    });
  };

  // Función para eliminar un caballo con mensajes específicos
  const eliminarCaballo = async (caballo) => {
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('No hay token de autenticación', 'error', 'Por favor, inicia sesión nuevamente.');
        setCargando(false);
        return;
      }
      
      const serialCaballo = caballo.serialCaballo;
      const response = await axios.delete(`http://localhost:10101/caballo/${serialCaballo}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      showAlert(`Caballo ${serialCaballo} eliminado con éxito`, 'success');
      setModalConfirmacion(false);
      cargarCaballos();
    } catch (error) {
      console.error('Error al eliminar caballo:', error);
      
      let mensaje = 'No se pudo eliminar el caballo';
      let detalle = '';
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          mensaje = 'Sesión expirada o no válida';
          detalle = 'Por favor, vuelve a iniciar sesión.';
        } else if (status === 403) {
          mensaje = 'No tienes permisos para eliminar este caballo';
          detalle = 'Esta función está limitada a usuarios con rol de Operador o Administrador.';
        } else if (status === 404) {
          mensaje = 'Caballo no encontrado';
          detalle = 'El caballo que intentas eliminar no existe o ya fue eliminado.';
        } else if (status === 409) {
          mensaje = 'No se puede eliminar el caballo';
          detalle = 'Este caballo está asignado a un recorrido activo.';
        } else if (status >= 500) {
          mensaje = 'Error en el servidor';
          detalle = `Error ${status}: No se pudo procesar la solicitud.`;
        }
        
        if (error.response.data && (error.response.data.mensaje || error.response.data.message)) {
          detalle = error.response.data.mensaje || error.response.data.message;
        }
      } else if (error.request) {
        mensaje = 'No se pudo conectar con el servidor';
        detalle = 'Verifica tu conexión a internet.';
      } else {
        detalle = error.message;
      }
      
      showAlert(mensaje, 'error', detalle);
    } finally {
      setCargando(false);
    }
  };

  // Función para ver detalles de un caballo con mensajes específicos
  const verDetalle = async (serial) => {
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showAlert('No hay token de autenticación', 'error', 'Por favor, inicia sesión nuevamente.');
        setCargando(false);
        return;
      }
      
      const response = await axios.get(`http://localhost:10101/caballo/${serial}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Agregar console.log para ver los detalles del caballo
      console.log('Detalles del caballo:', response.data);
      console.log('Estructura del caballo:', response.data.data);
      
      setApiRespuesta(response.data);
      setCaballoSeleccionado(response.data.data);
      setModalDetalle(true);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      
      let mensaje = 'No se pudieron cargar los detalles del caballo';
      let detalle = '';
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          mensaje = 'Sesión expirada o no válida';
          detalle = 'Por favor, vuelve a iniciar sesión.';
        } else if (status === 403) {
          mensaje = 'No tienes permisos para ver estos detalles';
          detalle = 'Esta información está limitada a ciertos roles de usuario.';
        } else if (status === 404) {
          mensaje = 'Caballo no encontrado';
          detalle = `No se encontró ningún caballo con el serial ${serial}.`;
        } else if (status >= 500) {
          mensaje = 'Error en el servidor';
          detalle = `Error ${status}: No se pudo procesar la solicitud.`;
        }
        
        if (error.response.data && (error.response.data.mensaje || error.response.data.message)) {
          detalle = error.response.data.mensaje || error.response.data.message;
        }
      } else if (error.request) {
        mensaje = 'No se pudo conectar con el servidor';
        detalle = 'Verifica tu conexión a internet.';
      } else {
        detalle = error.message;
      }
      
      showAlert(mensaje, 'error', detalle);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar caballos según la búsqueda y filtros
  const caballosFiltrados = caballos.filter(caballo => {
    // Lógica de filtrado
    let cumpleBusqueda = true;
    if (busqueda && busqueda.trim() !== '') {
      const busquedaLimpia = busqueda.trim().toLowerCase();
      cumpleBusqueda = caballo.serialCaballo?.toLowerCase().includes(busquedaLimpia);
    }
    
    let cumpleColorEstado = true;
    if (filtros.colorEstado !== 'todos') {
      if (filtros.colorEstado === 'optima') {
        cumpleColorEstado = caballo.estadoSalud?.includes('ptima');
      } else if (filtros.colorEstado === 'leve') {
        cumpleColorEstado = caballo.estadoSalud?.includes('leve') || caballo.estadoSalud?.includes('superficial');
      } else if (filtros.colorEstado === 'grave') {
        cumpleColorEstado = caballo.estadoSalud?.includes('notorio') || 
                            caballo.estadoSalud?.includes('grave') || 
                            caballo.estadoSalud?.includes('érdida') || 
                            caballo.estadoSalud?.includes('atiga');
      }
    }
    
    return cumpleBusqueda && cumpleColorEstado;
  }).sort((a, b) => {
    // Ordenar por serial (menor a mayor)
    const serialA = a.serialCaballo || '';
    const serialB = b.serialCaballo || '';
    
    // Verificar si ambos son números puros para ordenamiento numérico
    const isNumericA = /^\d+$/.test(serialA);
    const isNumericB = /^\d+$/.test(serialB);
    
    if (isNumericA && isNumericB) {
      // Si ambos son números, convertir para ordenamiento numérico
      return parseInt(serialA, 10) - parseInt(serialB, 10);
    }
    
    // Si hay seriales alfanuméricos, usar ordenamiento alfabético
    return serialA.localeCompare(serialB, undefined, {numeric: true, sensitivity: 'base'});
  });

  // Obtener estadísticas de los caballos
  const estadisticas = {
    total: caballos.length,
    saludables: caballos.filter(c => c.estadoSalud?.includes('ptima')).length,
    enTratamiento: caballos.filter(c => c.estadoSalud?.includes('leve') || c.estadoSalud?.includes('superficial')).length,
    otros: caballos.filter(c => c.estadoSalud?.includes('notorio') || 
                              c.estadoSalud?.includes('grave') || 
                              c.estadoSalud?.includes('érdida') || 
                              c.estadoSalud?.includes('atiga')).length
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-emerald-600 flex items-center">
              <FaHorse className="mr-2" /> Gestión de Caballos
            </h1>
            
            {/* Botón para crear nuevo caballo */}
            <button
              onClick={() => abrirModal()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus /> Crear Caballo
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Administra el registro completo de caballos disponibles para los recorridos
          </p>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
              <p className="text-sm mt-1">Si crees que esto es un error, contacta al administrador del sistema.</p>
            </div>
          )}

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
              <h3 className="text-xl font-semibold text-emerald-800">Total</h3>
              <p className="text-3xl font-bold text-emerald-600">{estadisticas.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow border border-green-100">
              <h3 className="text-xl font-semibold text-green-800">Óptimas</h3>
              <p className="text-3xl font-bold text-green-600">{estadisticas.saludables}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg shadow border border-orange-100">
              <h3 className="text-xl font-semibold text-orange-800">Leves</h3>
              <p className="text-3xl font-bold text-orange-600">{estadisticas.enTratamiento}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow border border-red-100">
              <h3 className="text-xl font-semibold text-red-800">Graves</h3>
              <p className="text-3xl font-bold text-red-600">{estadisticas.otros}</p>
            </div>
          </div>

          {/* Barra de herramientas */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full pl-10 p-2.5"
                placeholder="Buscar por serial..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setFiltroActivo(!filtroActivo)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${
                filtroActivo ? 'bg-emerald-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              <MdFilterList /> Filtros
            </button>
          </div>

          {/* Panel de filtros */}
          {filtroActivo && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <h3 className="font-medium mb-3 text-black">Filtros</h3>
              <div>
                {/* Solo filtro por categoría de color */}
                <label className="block text-sm font-medium text-black mb-1">Categoría de Estado</label>
                <select
                  className="bg-white border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                  value={filtros.colorEstado}
                  onChange={(e) => setFiltros({...filtros, colorEstado: e.target.value})}
                >
                  <option value="todos">Todos</option>
                  <option value="optima" className="bg-green-100">Óptimas condiciones</option>
                  <option value="leve" className="bg-orange-100">Problemas leves</option>
                  <option value="grave" className="bg-red-100">Problemas graves</option>
                </select>
              </div>
              
              {/* Indicadores de filtro activo */}
              <div className="flex flex-wrap gap-2 mt-3">
                {filtros.colorEstado !== 'todos' && (
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    filtros.colorEstado === 'optima' ? 'bg-green-100 text-green-800' :
                    filtros.colorEstado === 'leve' ? 'bg-orange-100 text-orange-800' :
                    filtros.colorEstado === 'grave' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    Categoría: {
                      filtros.colorEstado === 'optima' ? 'Óptimas condiciones' :
                      filtros.colorEstado === 'leve' ? 'Problemas leves' :
                      filtros.colorEstado === 'grave' ? 'Problemas graves' : 
                      filtros.colorEstado
                    }
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tabla de caballos */}
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-center text-sm font-medium text-black">Serial</th>
                  <th className="py-3 px-4 text-center text-sm font-medium text-black">Estado de Salud</th>
                  <th className="py-3 px-4 text-center text-sm font-medium text-black">Nombre Operador</th>
                  <th className="py-3 px-4 text-center text-sm font-medium text-black">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cargando ? (
                  <tr>
                    <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                      Cargando caballos...
                    </td>
                  </tr>
                ) : caballosFiltrados.length > 0 ? (
                  caballosFiltrados.map((caballo) => (
                    <tr key={caballo.serialCaballo || caballo._id || Math.random()} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800 text-center">{caballo.serialCaballo || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          caballo.estadoSalud?.includes('ptima') ? 'bg-green-100 text-green-800' :
                          caballo.estadoSalud?.includes('leve') || caballo.estadoSalud?.includes('superficial') ? 'bg-orange-100 text-orange-800' :
                          caballo.estadoSalud?.includes('notorio') || caballo.estadoSalud?.includes('grave') || caballo.estadoSalud?.includes('érdida') || caballo.estadoSalud?.includes('atiga') ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {caballo.estadoSalud || 'No especificado'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 text-center">
                        {`${caballo.primerNombre || ''} ${caballo.primerApellido || ''}`.trim() || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => abrirModal(caballo)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
                            title="Editar caballo"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => confirmarEliminacion(caballo)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                            title="Eliminar caballo"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                      No se encontraron caballos con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de creación/edición */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">
              {caballoSeleccionado ? 'Editar Caballo' : 'Nuevo Caballo'}
            </h2>
            
            <form onSubmit={guardarCaballo}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial del Caballo</label>
                <input
                  type="text"
                  name="serialCaballo"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                  value={formData.serialCaballo}
                  onChange={handleChange}
                  required
                  readOnly={!!caballoSeleccionado}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Salud</label>
                <input
                  type="text"
                  name="estadoSalud"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                  value={formData.estadoSalud}
                  onChange={handleChange}
                  placeholder="Describe el estado de salud del caballo"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Sugerencias: "Óptimas condiciones", "Herida superficial", "Dolor leve", "Dolor notorio", "Herida grave", etc.
                </p>
              </div>
              
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 flex items-center">
                  <FaInfoCircle className="mr-2" /> 
                  El caballo se registrará automáticamente bajo el operador actualmente conectado.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                  disabled={cargando}
                >
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {modalConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Confirmar Eliminación</h2>
            <p className="mb-6 text-white">
              ¿Estás seguro de que deseas eliminar el caballo con serial <span className="font-semibold">{caballoSeleccionado.serialCaballo}</span>? Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalConfirmacion(false)}
                className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarCaballo(caballoSeleccionado)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                disabled={cargando}
              >
                {cargando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {modalDetalle && caballoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-indigo-800 mb-4">Detalles del Caballo</h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <FaHorse className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-indigo-600 font-medium">Serial: {caballoSeleccionado.serialCaballo}</p>
                    <p className={`text-sm ${
                      caballoSeleccionado.estadoSalud === 'Saludable' ? 'text-green-600' :
                      caballoSeleccionado.estadoSalud === 'En tratamiento' ? 'text-orange-600' :
                      caballoSeleccionado.estadoSalud === 'Recuperación' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      Estado: {caballoSeleccionado.estadoSalud || 'No especificado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Operador: {`${caballoSeleccionado.primerNombre || ''} ${caballoSeleccionado.primerApellido || ''}`.trim() || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Información detallada de la API */}
              <div className="border border-gray-200 rounded-lg divide-y">
                <div className="p-3">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    <FaInfoCircle className="text-blue-500" /> Datos de API
                  </h4>
                </div>
                
                <div className="p-3 bg-gray-50">
                  <h5 className="text-sm font-medium text-white mb-1">Respuesta Completa de la API</h5>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-40">
                    {JSON.stringify(apiRespuesta, null, 2)}
                  </pre>
                </div>
                
                <div className="p-3 bg-gray-50">
                  <h5 className="text-sm font-medium text-white mb-1">Objeto Completo de Datos</h5>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-32">
                    {JSON.stringify(caballoSeleccionado, null, 2)}
                  </pre>
                </div>
                
                <div className="p-3 bg-gray-50">
                  <h5 className="text-sm font-medium text-white mb-1">Token Actual</h5>
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">Token original que se usa en las solicitudes API:</p>
                    <div className="mt-1 bg-gray-100 p-2 rounded overflow-x-auto max-h-20">
                      <code className="text-xs break-all">{localStorage.getItem('token') || 'No disponible'}</code>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Contenido decodificado del token:</p>
                    <button 
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 mt-1"
                      onClick={() => {
                        try {
                          const token = localStorage.getItem('token');
                          if (!token) {
                            alert('No hay token almacenado');
                            return;
                          }
                          const [header, payload, signature] = token.split('.');
                          const decodedPayload = JSON.parse(atob(payload));
                          
                          // Crear un modal secundario para mostrar la información
                          const modalDiv = document.createElement('div');
                          modalDiv.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]';
                          modalDiv.innerHTML = `
                            <div class="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
                              <h3 class="text-xl font-bold text-blue-800 mb-4">Información del Token</h3>
                              <pre class="text-xs bg-gray-100 p-3 rounded overflow-x-auto">${JSON.stringify(decodedPayload, null, 2)}</pre>
                              <div class="flex justify-end mt-4">
                                <button id="closeTokenModal" class="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-gray-300">
                                  Cerrar
                                </button>
                              </div>
                            </div>
                          `;
                          document.body.appendChild(modalDiv);
                          document.getElementById('closeTokenModal').addEventListener('click', () => {
                            document.body.removeChild(modalDiv);
                          });
                        } catch (e) {
                          alert('Error al decodificar token: ' + e.message);
                        }
                      }}
                    >
                      Ver contenido decodificado
                    </button>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50">
                  <h5 className="text-sm font-medium text-white mb-1">Roles y Permisos</h5>
                  <p className="text-xs text-gray-500">Roles esperados por el backend:</p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">admin</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Operador</span>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Guía</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalDetalle(false);
                  abrirModal(caballoSeleccionado);
                }}
                className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Editar
              </button>
              <button
                onClick={() => setModalDetalle(false)}
                className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Caballos; 