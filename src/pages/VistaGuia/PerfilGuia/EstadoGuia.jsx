import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Clock, Radio, BellRing, Ban, Check } from 'lucide-react';
import estadoServiceGuia from '../../../services/estadoServiceGuia';

// Colores para cada estado - estilo call center
const ESTADOS_CONFIG = {
  disponible: {
    color: '#10B981',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
    icon: <Check className="w-5 h-5" />,
    label: 'Disponible',
    description: 'Listo para atender'
  },
  ocupado: {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    icon: <BellRing className="w-5 h-5" />,
    label: 'Ocupado',
    description: 'En servicio'
  },
  inactivo: {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    icon: <Ban className="w-5 h-5" />,
    label: 'Inactivo',
    description: 'No disponible'
  }
};

// Intervalo de sincronización en ms (5 segundos)
const SYNC_INTERVAL = 5000;

const EstadoGuia = () => {
  const [estadoActual, setEstadoActual] = useState('');
  const [cargando, setCargando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaSincronizacion, setUltimaSincronizacion] = useState(null);
  const [error, setError] = useState(null);
  const [transicion, setTransicion] = useState(false);
  const timerRef = useRef(null);
  const cedulaGuia = localStorage.getItem('cedula');
  const token = localStorage.getItem('token');
  
  // Función para obtener el estado actual del servidor
  const obtenerEstadoDesdeServidor = async () => {
    try {
      if (!cedulaGuia || !token) {
        throw new Error("No hay sesión activa");
      }
      
      setSincronizando(true);
      
      const response = await axios.get(
        `https://servicio-explococora.onrender.com/usuarios/consultar-estado/${cedulaGuia}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data && response.data.data && response.data.data.estado) {
        const nuevoEstado = response.data.data.estado;
        
        // Guardar en localStorage con timestamp
        localStorage.setItem('ultimoEstadoGuia', nuevoEstado);
        localStorage.setItem('ultimoEstadoGuiaTimestamp', Date.now().toString());
        
        // Actualizar servicio centralizado también
        estadoServiceGuia.setEstado(nuevoEstado);
        
        setEstadoActual(nuevoEstado);
        setUltimaSincronizacion(new Date());
        setError(null);
        return nuevoEstado;
      } else {
        throw new Error("No se pudo obtener el estado del servidor");
      }
    } catch (err) {
      console.error("Error al obtener estado:", err);
      setError(err.message);
      
      // Usar estado guardado desde el servicio centralizado
      const estadoGuardado = estadoServiceGuia.getEstado();
      if (estadoGuardado) {
        return estadoGuardado;
      }
      return 'disponible'; // Estado por defecto
    } finally {
      setSincronizando(false);
    }
  };
  
  // Función para cambiar el estado
  const cambiarEstado = async (nuevoEstado) => {
    try {
      // Primero actualizamos localmente a través del servicio centralizado
      estadoServiceGuia.setEstado(nuevoEstado);
      
      // Actualizamos el estado del componente
      setEstadoActual(nuevoEstado);
      setTransicion(true);
      setTimeout(() => setTransicion(false), 500);
      
      // Hacemos animación de transición
      setUltimaSincronizacion(new Date());
      
      // Luego enviamos al servidor
      if (!cedulaGuia || !token) {
        throw new Error("No hay sesión activa");
      }
      
      setSincronizando(true);
      
      const response = await axios.patch(
        'https://servicio-explococora.onrender.com/usuarios/cambiar-estado',
        {
          cedula: cedulaGuia,
          nuevoEstado: nuevoEstado
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Actualizar timestamp de última sincronización
      setUltimaSincronizacion(new Date());
      setError(null);
      
      return true;
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError(`Error: ${err.message}`);
      
      // A pesar del error, mantenemos el estado visual
      return false;
    } finally {
      setSincronizando(false);
    }
  };
  
  // Efecto para cargar el estado inicial y configurar sincronización periódica
  useEffect(() => {
    const iniciarSincronizacion = async () => {
      setCargando(true);
      
      try {
        // 1. Primero intentar usar el estado desde el servicio centralizado
        const estadoGuardado = estadoServiceGuia.getEstado();
        
        if (estadoGuardado) {
          // Usar inmediatamente el estado guardado
          setEstadoActual(estadoGuardado);
          setUltimaSincronizacion(new Date());
          
          // Notificar a otros componentes
          window.dispatchEvent(new CustomEvent('estadoGuiaCambiado', { 
            detail: { estado: estadoGuardado } 
          }));
        }
        
        // 2. Luego sincronizar con el servidor (en segundo plano)
        setTimeout(() => {
          obtenerEstadoDesdeServidor().then(estado => {
            if (estado && estado !== estadoGuardado) {
              // Solo actualizar si hay cambio
              setEstadoActual(estado);
              
              // Guardar en el servicio centralizado también
              estadoServiceGuia.setEstado(estado);
              
              // Notificar a otros componentes
              window.dispatchEvent(new CustomEvent('estadoGuiaCambiado', { 
                detail: { estado: estado } 
              }));
            }
          });
        }, 500);
        
      } catch (err) {
        console.error("Error al iniciar sincronización:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    
    // Iniciar sincronización al montar el componente
    iniciarSincronizacion();
    
    // Escuchar cambios en el estado central
    const handleEstadoChange = (event) => {
      const nuevoEstado = event.detail.estado;
      setEstadoActual(nuevoEstado);
    };
    
    window.addEventListener('estadoGuiaCambiado', handleEstadoChange);
    
    // Configurar sincronización periódica
    const syncInterval = setInterval(obtenerEstadoDesdeServidor, SYNC_INTERVAL);
    
    // Actualizar cuando el documento recupere visibilidad
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        obtenerEstadoDesdeServidor();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Actualizar cuando la ventana recupere el foco
    window.addEventListener('focus', obtenerEstadoDesdeServidor);
    
    // Limpiar
    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', obtenerEstadoDesdeServidor);
      window.removeEventListener('estadoGuiaCambiado', handleEstadoChange);
    };
  }, []);
  
  // Reloj para mostrar tiempo en estado actual
  useEffect(() => {
    const updateClock = () => {
      timerRef.current = setTimeout(updateClock, 1000);
    };
    
    updateClock();
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [estadoActual]);
  
  if (cargando) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-100 rounded-lg shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Cargando estado...</span>
      </div>
    );
  }
  
  const config = ESTADOS_CONFIG[estadoActual] || ESTADOS_CONFIG.disponible;
  
  return (
    <div className="flex flex-col w-full">
      {/* Panel principal de estado */}
      <div 
        className={`p-4 rounded-lg shadow-md transition-all duration-300 ${transicion ? 'scale-105' : ''}`}
        style={{
          backgroundColor: config.bgColor,
          borderLeft: `6px solid ${config.borderColor}`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-full mr-4"
              style={{ backgroundColor: config.borderColor }}
            >
              {React.cloneElement(config.icon, { color: 'white' })}
            </div>
            
            <div>
              <h3 className="text-lg font-bold" style={{ color: config.color }}>
                {config.label}
              </h3>
              <p className="text-sm text-gray-700">{config.description}</p>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span>
              {ultimaSincronizacion ? (
                `Última sincronización: ${ultimaSincronizacion.toLocaleTimeString()}`
              ) : 'No sincronizado'}
            </span>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 text-sm rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
      
      {/* Botones de selección de estado */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {Object.entries(ESTADOS_CONFIG).map(([estado, config]) => (
          <button
            key={estado}
            onClick={() => cambiarEstado(estado)}
            disabled={sincronizando || estadoActual === estado}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              ${estadoActual === estado ? 'ring-2 ring-offset-2' : 'hover:shadow-md'}
              ${sincronizando ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{
              backgroundColor: estadoActual === estado ? config.bgColor : 'white',
              borderColor: config.borderColor,
              color: config.color
            }}
          >
            <div className="flex flex-col items-center">
              {React.cloneElement(config.icon, { className: "w-6 h-6 mb-2" })}
              <span className="font-medium">{config.label}</span>
            </div>
          </button>
        ))}
      </div>
      
      {sincronizando && (
        <div className="mt-3 flex items-center justify-center text-blue-500 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <span>Sincronizando con el servidor...</span>
        </div>
      )}
    </div>
  );
};

export default EstadoGuia;
