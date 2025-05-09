import React, { useState, useEffect } from 'react';
import { Check, BellRing, Ban, ChevronDown, X } from 'lucide-react';
import operadorEstadoService from '../../services/operadorEstadoService';

// Configuración de colores y estilos para cada estado
const ESTADOS_CONFIG = {
  disponible: {
    color: '#10B981', // Verde
    icon: <Check className="w-4 h-4" />,
    label: 'Disponible'
  },
  ocupado: {
    color: '#F59E0B', // Naranja/Amarillo
    icon: <BellRing className="w-4 h-4" />,
    label: 'Ocupado'
  },
  inactivo: {
    color: '#EF4444', // Rojo
    icon: <Ban className="w-4 h-4" />,
    label: 'Inactivo'
  }
};

// Componente de alerta flotante
const AlertaEstado = ({ nombre, estado, onClose }) => {
  const config = ESTADOS_CONFIG[estado] || ESTADOS_CONFIG.disponible;
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-fadeIn">
      <div className={`p-4 rounded-md shadow-xl flex items-center border ${
        estado === 'disponible' ? 'bg-green-50 border-green-200 text-green-800' : 
        estado === 'ocupado' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 
        'bg-red-50 border-red-200 text-red-800'
      }`}>
        {config.icon}
        <span className="ml-2 text-sm font-medium">
          {nombre ? `El estado de ${nombre} ha cambiado a ${config.label}` : `Estado cambiado a ${config.label}`}
        </span>
        <button
          type="button"
          className="ml-4 hover:bg-opacity-20"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const EstadoOperador = ({ cedula, nombre, tamanio = 'normal', onChangeEstado = null }) => {
  const [estado, setEstado] = useState(operadorEstadoService.getEstado(cedula) || 'disponible');
  const [cargando, setCargando] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  
  // Cargar estado actual al montar el componente
  useEffect(() => {
    const cargarEstado = async () => {
      setCargando(true);
      
      // Intentar obtener estado desde servicio (memoria o localStorage)
      const estadoGuardado = operadorEstadoService.getEstado(cedula);
      if (estadoGuardado) {
        setEstado(estadoGuardado);
      }
      
      // Suscribirse a cambios
      const cancelarSuscripcion = operadorEstadoService.suscribirActualizacion(
        cedula,
        (nuevoEstado) => setEstado(nuevoEstado)
      );
      
      // Intentar obtener estado fresco desde servidor (en segundo plano)
      try {
        const estadoServidor = await operadorEstadoService.obtenerEstadoDesdeServidor(cedula);
        if (estadoServidor && estadoServidor !== estado) {
          setEstado(estadoServidor);
        }
      } catch (error) {
        console.error('Error al cargar estado:', error);
      } finally {
        setCargando(false);
      }
      
      // Limpiar suscripción
      return cancelarSuscripcion;
    };
    
    cargarEstado();
    
    // También escuchar eventos globales
    const handleEstadoCambiado = (event) => {
      if (event.detail && event.detail.cedula === cedula) {
        setEstado(event.detail.estado);
      }
    };
    
    window.addEventListener('estadoOperadorCambiado', handleEstadoCambiado);
    
    return () => {
      window.removeEventListener('estadoOperadorCambiado', handleEstadoCambiado);
    };
  }, [cedula, estado]);
  
  // Cambiar estado
  const cambiarEstado = async (nuevoEstado) => {
    if (estado === nuevoEstado || !cedula) return;
    
    setCargando(true);
    setMostrarSelector(false);
    
    try {
      // Actualizar estado a través del servicio (local + servidor)
      await operadorEstadoService.cambiarEstado(cedula, nuevoEstado);
      
      // Mostrar alerta de cambio de estado
      setMostrarAlerta(true);
      
      // Ocultar la alerta después de 5 segundos
      setTimeout(() => setMostrarAlerta(false), 5000);
      
      // Notificar al componente padre si existe callback
      if (onChangeEstado) {
        onChangeEstado(nuevoEstado);
      }
      
      // Emitir evento global para la alerta
      window.dispatchEvent(new CustomEvent('operadorEstadoCambiado', {
        detail: {
          cedula,
          nombre,
          estadoAnterior: estado,
          nuevoEstado
        }
      }));
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setCargando(false);
    }
  };
  
  // Obtener configuración del estado actual
  const config = ESTADOS_CONFIG[estado] || ESTADOS_CONFIG.disponible;
  
  // Renderizar según el tamaño solicitado
  if (tamanio === 'boton') {
    return (
      <>
        <button 
          onClick={() => setMostrarSelector(!mostrarSelector)}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
            estado === 'disponible' ? 'bg-green-600 hover:bg-green-700' : 
            estado === 'ocupado' ? 'bg-yellow-600 hover:bg-yellow-700' : 
            'bg-red-600 hover:bg-red-700'
          } text-white`}
        >
          {config.label}
        </button>
        
        {mostrarSelector && (
          <div className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-md shadow-lg z-10">
            <div className="py-1">
              {Object.entries(ESTADOS_CONFIG).map(([estadoKey, estadoConfig]) => (
                <button 
                  key={estadoKey}
                  onClick={() => cambiarEstado(estadoKey)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  style={{ color: estadoConfig.color }}
                  disabled={estado === estadoKey || cargando}
                >
                  <span className="mr-2">{estadoConfig.icon}</span>
                  {estadoConfig.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {mostrarAlerta && (
          <AlertaEstado 
            nombre={nombre}
            estado={estado}
            onClose={() => setMostrarAlerta(false)}
          />
        )}
      </>
    );
  }
  
  // Para tamaño normal (badge/etiqueta)
  return (
    <>
      <div className="relative">
        <div 
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center cursor-pointer ${
            estado === 'disponible' ? 'bg-green-100 text-green-800' : 
            estado === 'ocupado' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}
          onClick={() => setMostrarSelector(!mostrarSelector)}
        >
          {config.icon && <span className="mr-1">{config.icon}</span>}
          {config.label}
        </div>
        
        {mostrarSelector && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10">
            <div className="py-1">
              {Object.entries(ESTADOS_CONFIG).map(([estadoKey, estadoConfig]) => (
                <button 
                  key={estadoKey}
                  onClick={() => cambiarEstado(estadoKey)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  style={{ color: estadoConfig.color }}
                  disabled={estado === estadoKey || cargando}
                >
                  <span className="mr-2">{estadoConfig.icon}</span>
                  {estadoConfig.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {mostrarAlerta && (
        <AlertaEstado 
          nombre={nombre}
          estado={estado}
          onClose={() => setMostrarAlerta(false)}
        />
      )}
    </>
  );
};

export default EstadoOperador;
