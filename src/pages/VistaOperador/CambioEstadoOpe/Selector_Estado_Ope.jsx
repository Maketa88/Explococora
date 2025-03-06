import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, CheckCircle } from 'lucide-react';

const SelectorEstado = ({ estadoActual = 'disponible', onCambioEstado, cedula, esAdmin = false, esPropio = true, id }) => {
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

  // Definimos los estados disponibles y sus colores
  const estados = [
    { nombre: 'disponible', color: 'bg-blue-500 hover:bg-blue-600', notifColor: 'bg-blue-100 text-blue-800 border-blue-300' },
    { nombre: 'ocupado', color: 'bg-yellow-500 hover:bg-yellow-600', notifColor: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { nombre: 'inactivo', color: 'bg-red-500 hover:bg-red-600', notifColor: 'bg-red-100 text-red-800 border-red-300' }
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

  // Obtener el color del estado actual
  const obtenerColorEstado = (nombreEstado) => {
    const estadoParaBuscar = nombreEstado && nombreEstado.trim().toLowerCase();
    
    if (!estadoParaBuscar) {
      return 'bg-gray-500 hover:bg-gray-600';
    }
    
    const estadoEncontrado = estados.find(e => e.nombre === estadoParaBuscar);
    if (estadoEncontrado) {
      return estadoEncontrado.color;
    } else {
      return 'bg-gray-500 hover:bg-gray-600';
    }
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

  const cambiarEstado = async (nuevoEstado) => {
    try {
      // Actualizar el estado en la UI primero
      setEstado(nuevoEstado);
      setMostrarMenu(false);
      
      // Solo para operador principal: guardar en localStorage y sessionStorage
      if (esOperadorPrincipal) {
        localStorage.setItem(claveStorage, nuevoEstado);
        localStorage.setItem('ultimoEstadoTimestamp', Date.now().toString());
        
        // Guardar backup solo para operador principal
        sessionStorage.setItem('estadoOperadorBackup', JSON.stringify({
          estado: nuevoEstado,
          timestamp: Date.now()
        }));
        
        // Crear evento global solo para operador principal
        window.dispatchEvent(new CustomEvent('estadoOperadorCambiado', { 
          detail: { estado: nuevoEstado } 
        }));
      }
      
      // Mostrar notificación inmediatamente
      mostrarToast(`Tu estado ha cambiado a ${formatearEstado(nuevoEstado)}`, nuevoEstado);
      
      // Llamar al callback si existe
      if (typeof onCambioEstado === 'function') {
        onCambioEstado(nuevoEstado);
      }
      
      // Ahora hacer la llamada al servidor
      let url = 'http://localhost:10101/usuarios/cambiar-estado';
      let data = { nuevoEstado };
      
      if (cedula) {
        data.cedula = cedula;
      } else if (id) {
        data.id = id;
      } else {
        // Intentar obtener cédula del localStorage
        const cedulaLocal = localStorage.getItem('cedula');
        if (cedulaLocal) {
          data.cedula = cedulaLocal;
        } else {
          throw new Error("Se requiere cédula o ID para cambiar el estado");
        }
      }
      
      const response = await axios.patch(url, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status !== 200) {
        console.error("Error al cambiar estado en el servidor");
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      // NO revertimos el estado visual para evitar confusión
      setTimeout(() => {
        mostrarToast(`Error de conexión, pero tu estado visual se ha actualizado`, 'inactivo');
      }, 3500);
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
        className={`flex items-center justify-between px-4 py-2 rounded-lg text-white font-medium min-w-[120px] transition-all duration-200 ${obtenerColorEstado(estado)}`}
      >
        <span>{formatearEstado(estado)}</span>
        <ChevronDown className={`ml-2 w-5 h-5 transition-transform duration-200 ${mostrarMenu ? 'transform rotate-180' : ''}`} />
      </button>

      {/* Menú desplegable */}
      {mostrarMenu && (
        <div className="absolute right-0 mt-2 w-full min-w-[120px] rounded-lg shadow-lg z-50 overflow-hidden transition-all duration-200 transform origin-top scale-100">
          {estados.map((e) => (
            <button
              key={e.nombre}
              onClick={() => cambiarEstado(e.nombre)}
              className={`w-full text-center py-2 px-4 text-white font-medium ${e.color} ${estado === e.nombre ? 'opacity-70' : ''}`}
              disabled={estado === e.nombre}
            >
              {formatearEstado(e.nombre)}
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
    