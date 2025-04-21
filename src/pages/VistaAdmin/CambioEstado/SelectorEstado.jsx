import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, CheckCircle } from 'lucide-react';

const SelectorEstado = ({ estadoActual = 'disponible', onCambioEstado, cedula, esAdmin = false, esPropio = true, id }) => {
  // Normalizar el estado inicial para evitar valores undefined o inválidos
  const estadoNormalizado = estadoActual && ['disponible', 'ocupado', 'inactivo'].includes(estadoActual) 
    ? estadoActual 
    : 'disponible';
  
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

  // Actualizar estado interno cuando cambia estadoActual prop
  useEffect(() => {
    if (estadoActual && ['disponible', 'ocupado', 'inactivo'].includes(estadoActual)) {
      setEstado(estadoActual);
    }
  }, [estadoActual]);

  // Obtener el color del estado actual - con mejor manejo de casos desconocidos
  const obtenerColorEstado = (nombreEstado) => {
    // Normalizar estado para búsqueda
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

  // Función para mostrar la notificación
  const mostrarToast = (mensaje, estado) => {
    setMensajeNotificacion(mensaje);
    setColorNotificacion(obtenerColorNotificacion(estado));
    setMostrarNotificacion(true);
    
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setMostrarNotificacion(false);
    }, 3000);
  };

  const toggleMenu = () => {
    setMostrarMenu(!mostrarMenu);
  };

  const cambiarEstado = async (nuevoEstado) => {
    try {
      const url = 'https://servicio-explococora.onrender.com/usuarios/cambiar-estado';
      let data = { nuevoEstado };
      
      // Si es admin cambiando su propio estado
      if (esAdmin && esPropio) {
        data.id = id; // Admin usa ID
      } 
      // Si es admin cambiando el estado de otro usuario
      else if (esAdmin && !esPropio) {
        if (cedula) {
          data.cedula = cedula;
        } else if (id) {
          data.id = id;
        } else {
          throw new Error("Se requiere cédula o ID para cambiar el estado");
        }
      } 
      // Si es guía u operador cambiando su propio estado
      else {
        if (!cedula) {
          throw new Error("Se requiere cédula para cambiar el estado");
        }
        data.cedula = cedula;
      }
      
      const response = await axios.patch(url, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 200) {
        console.log("Estado cambiado exitosamente");
        setEstado(nuevoEstado);
        
        // Llamar al callback
        if (typeof onCambioEstado === 'function') {
          onCambioEstado(nuevoEstado);
        }
        
        setMostrarMenu(false);
        
        // Guardar en localStorage inmediatamente
        localStorage.setItem("ultimoEstado", nuevoEstado);
        
        // Mostrar notificación
        mostrarToast(`Tu estado ha cambiado a ${formatearEstado(nuevoEstado)}`, nuevoEstado);
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert(error.response?.data?.message || error.message || "Error al cambiar el estado");
    }
  };

  // Capitaliza la primera letra para mostrarlo más bonito
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
    