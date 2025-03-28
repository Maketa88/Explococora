import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, CheckCircle, Check, BellRing, Ban } from 'lucide-react';

const SelectorEstado = ({ estadoActual = 'disponible', onCambioEstado, cedula, esPropio = true, id }) => {
  // IMPORTANTE: Determinar si este selector es del operador principal o de un guía
  const esOperadorPrincipal = esPropio && !id;
  
  // Usar clave diferente según si es operador principal o guía
  const claveStorage = esOperadorPrincipal ? 'ultimoEstadoOperador' : `estadoGuia_${id || cedula}`;
  
  // Normalizar el estado inicial
  const estadoGuardado = esOperadorPrincipal ? localStorage.getItem(claveStorage) : null;
  const estadoNormalizado = estadoGuardado || 
    (estadoActual && ['disponible', 'ocupado', 'inactivo'].includes(estadoActual) 
      ? estadoActual 
      : 'disponible');
  
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [estado, setEstado] = useState(estadoNormalizado);
  const menuRef = useRef(null);
  
  // Estados para la notificación
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState('');
  const [colorNotificacion, setColorNotificacion] = useState('');

  // Definimos los estados disponibles y sus colores - actualizado a los colores estándar
  const estados = [
    { 
      nombre: 'disponible', 
      color: 'bg-green-500 hover:bg-green-600', 
      textColor: 'text-green-600',
      borderColor: 'border-green-500',
      notifColor: 'bg-green-50 text-green-700 border-green-200',
      icon: <Check className="w-3.5 h-3.5 text-green-500 mr-1.5" />
    },
    { 
      nombre: 'ocupado', 
      color: 'bg-amber-500 hover:bg-amber-600', 
      textColor: 'text-amber-600',
      borderColor: 'border-amber-500',
      notifColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <BellRing className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
    },
    { 
      nombre: 'inactivo', 
      color: 'bg-red-500 hover:bg-red-600', 
      textColor: 'text-red-600',
      borderColor: 'border-red-500',
      notifColor: 'bg-red-50 text-red-700 border-red-200',
      icon: <Ban className="w-3.5 h-3.5 text-red-500 mr-1.5" />
    }
  ];

  // Actualizar el localStorage SOLO si es operador principal
  useEffect(() => {
    if (estado && esOperadorPrincipal) {
      localStorage.setItem(claveStorage, estado);
      localStorage.setItem('ultimoEstadoTimestamp', Date.now().toString());
      
      // Crear evento global SOLO para operador principal
      window.dispatchEvent(new CustomEvent('estadoOperadorCambiado', { 
        detail: { estado: estado } 
      }));
    }
  }, [estado, esOperadorPrincipal, claveStorage]);

  // Obtener el color de texto del estado
  const obtenerTextColorEstado = (nombreEstado) => {
    const estadoEncontrado = estados.find(e => e.nombre === nombreEstado);
    return estadoEncontrado ? estadoEncontrado.textColor : 'text-gray-600';
  };

  // Obtener el color de borde del estado
  const obtenerBorderColorEstado = (nombreEstado) => {
    const estadoEncontrado = estados.find(e => e.nombre === nombreEstado);
    return estadoEncontrado ? estadoEncontrado.borderColor : 'border-gray-500';
  };

  // Obtener el icono del estado
  const obtenerIconoEstado = (nombreEstado) => {
    const estadoEncontrado = estados.find(e => e.nombre === nombreEstado);
    return estadoEncontrado ? estadoEncontrado.icon : null;
  };
  
  // Obtener el color de notificación para el estado
  const obtenerColorNotificacion = (nombreEstado) => {
    const estadoEncontrado = estados.find(e => e.nombre === nombreEstado);
    return estadoEncontrado ? estadoEncontrado.notifColor : 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMostrarMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mostrar notificación
  const mostrarToast = (mensaje, estado) => {
    setMensajeNotificacion(mensaje);
    setColorNotificacion(obtenerColorNotificacion(estado));
    setMostrarNotificacion(true);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      setMostrarNotificacion(false);
    }, 3000);
  };

  const toggleMenu = () => {
    setMostrarMenu(!mostrarMenu);
  };

  // Función simplificada para cambiar estado que prioriza la sincronización con BD
  const cambiarEstado = async (nuevoEstado) => {
    try {
      // Verificar y refrescar token si está a punto de expirar
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarToast("Sesión no iniciada", 'inactivo');
        return;
      }
      
      // Actualizar UI primero
      setEstado(nuevoEstado);
      setMostrarMenu(false);
      mostrarToast(`Cambiando estado a ${formatearEstado(nuevoEstado)}...`, nuevoEstado);
      
      // Preparar datos para el backend según CambioEstadoDto
      const usuarioCedula = cedula || localStorage.getItem('cedula');
      const payload = {
        nuevoEstado: nuevoEstado,
        rol: esPropio ? 'operador' : 'guia',
        cedula: usuarioCedula
      };
      
      // Si tenemos ID pero no cédula, usarlo
      if (id && !usuarioCedula) {
        delete payload.cedula;
        payload.id = id;
      }
      
      // Enviar con estructura exacta que el backend espera
      const response = await axios({
        method: 'PATCH',
        url: 'http://localhost:10101/usuarios/cambiar-estado',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });
      
      if (response.status === 200) {
        // Éxito - actualizar UI
        mostrarToast(`Estado actualizado a ${formatearEstado(nuevoEstado)}`, nuevoEstado);
        
        // Sincronizar en localStorage solo si es necesario
        if (esOperadorPrincipal) {
          localStorage.setItem(claveStorage, nuevoEstado);
          localStorage.setItem('ultimoEstadoTimestamp', Date.now().toString());
        }
        
        // Llamar al callback si existe
        if (typeof onCambioEstado === 'function') {
          onCambioEstado(nuevoEstado);
        }
      } else {
        throw new Error(`Respuesta inesperada: ${response.status}`);
      }
    } catch (error) {
      // Si el error es 403, probablemente sea un problema de token
      if (error.response && error.response.status === 403) {
        mostrarToast("No tienes permiso para realizar esta acción", 'inactivo');
        
        // Opcionalmente, puedes intentar redirigir al login
        if (confirm("Tu sesión ha expirado o no tienes permisos. ¿Deseas iniciar sesión nuevamente?")) {
          localStorage.removeItem('token');
          window.location.href = '/Ingreso';
        }
      } else {
        // Mostrar mensaje de error sin reintentos
        setEstado(estado);
        mostrarToast(`Error al cambiar estado. Intente de nuevo más tarde.`, 'inactivo');
      }
    }
  };

  const formatearEstado = (estado) => {
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón principal que muestra el estado actual */}
      <button
        onClick={toggleMenu}
        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium min-w-[110px] transition-all duration-200 
          bg-white border ${obtenerBorderColorEstado(estado)} ${obtenerTextColorEstado(estado)} 
          hover:bg-gray-50 shadow-sm`}
      >
        <div className="flex items-center">
          {obtenerIconoEstado(estado)}
          <span>{formatearEstado(estado)}</span>
        </div>
        <ChevronDown className={`ml-1.5 w-4 h-4 transition-transform duration-200 ${mostrarMenu ? 'transform rotate-180' : ''}`} />
      </button>

      {/* Menú desplegable */}
      {mostrarMenu && (
        <div className="absolute right-0 mt-1 w-36 rounded-lg shadow-lg z-50 overflow-hidden border border-gray-100 bg-white">
          {estados.map((e) => (
            <button
              key={e.nombre}
              onClick={() => cambiarEstado(e.nombre)}
              className={`w-full text-left py-1.5 px-3 text-sm hover:bg-gray-50 flex items-center ${
                estado === e.nombre ? 'bg-gray-50' : ''
              } ${estado === e.nombre ? 'border-l-2 ' + e.borderColor : 'border-l-2 border-transparent'}`}
              disabled={estado === e.nombre}
            >
              {e.icon}
              <span className={e.textColor}>{formatearEstado(e.nombre)}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Notificación toast */}
      {mostrarNotificacion && (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 mb-4 rounded-lg border ${colorNotificacion} shadow-md transition-all duration-500 animate-fade-in-down`} role="alert">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="sr-only">Info</span>
          <div className="text-sm font-medium">{mensajeNotificacion}</div>
          <button 
            type="button" 
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-opacity-20 focus:outline-none"
            onClick={() => setMostrarNotificacion(false)}
            aria-label="Cerrar"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectorEstado;
    