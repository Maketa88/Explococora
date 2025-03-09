import React, { useState, useEffect } from 'react';
import { Check, BellRing, Ban, ChevronDown, X } from 'lucide-react';
import guiaEstadoService from '../../services/guiaEstadoService';

// Configuración de colores y estilos para cada estado - estilo call center como el original
const ESTADOS_CONFIG = {
  disponible: {
    color: '#10B981',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
    buttonClass: 'bg-blue-500 hover:bg-blue-600',
    alertClass: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Check className="w-4 h-4" />,
    label: 'Disponible'
  },
  ocupado: {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    buttonClass: 'bg-yellow-500 hover:bg-yellow-600',
    alertClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: <BellRing className="w-4 h-4" />,
    label: 'Ocupado'
  },
  inactivo: {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    buttonClass: 'bg-red-500 hover:bg-red-600',
    alertClass: 'bg-red-50 border-red-200 text-red-800',
    icon: <Ban className="w-4 h-4" />,
    label: 'Inactivo'
  }
};

// Componente de alerta flotante
const AlertaEstado = ({ nombre, estado, onClose }) => {
  const config = ESTADOS_CONFIG[estado] || ESTADOS_CONFIG.disponible;
  
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center p-4 mb-4 rounded-lg border ${config.alertClass} shadow-md transition-all duration-500 animate-fade-in-down`}>
      {config.icon}
      <span className="ml-2 text-sm font-medium">
        {nombre ? `El estado de ${nombre} ha cambiado a ${config.label}` : `Estado cambiado a ${config.label}`}
      </span>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-opacity-20"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const EstadoGuia = ({ cedula, nombre, tamanio = 'normal', onChangeEstado = null }) => {
  const [estado, setEstado] = useState(guiaEstadoService.getEstado(cedula) || 'disponible');
  const [cargando, setCargando] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  
  // Cargar estado actual al montar el componente
  useEffect(() => {
    const cargarEstado = async () => {
      setCargando(true);
      
      // Intentar obtener estado desde servicio (memoria o localStorage)
      const estadoGuardado = guiaEstadoService.getEstado(cedula);
      if (estadoGuardado) {
        setEstado(estadoGuardado);
      }
      
      // Suscribirse a cambios
      const cancelarSuscripcion = guiaEstadoService.suscribirActualizacion(
        cedula,
        (nuevoEstado) => setEstado(nuevoEstado)
      );
      
      // Intentar obtener estado fresco desde servidor (en segundo plano)
      try {
        const estadoServidor = await guiaEstadoService.obtenerEstadoDesdeServidor(cedula);
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
    
    window.addEventListener('estadoGuiaCambiado', handleEstadoCambiado);
    
    return () => {
      window.removeEventListener('estadoGuiaCambiado', handleEstadoCambiado);
    };
  }, [cedula, estado]);
  
  // Cambiar estado
  const cambiarEstado = async (nuevoEstado) => {
    if (estado === nuevoEstado || !cedula) return;
    
    setCargando(true);
    setMostrarSelector(false);
    
    try {
      // Actualizar estado a través del servicio (local + servidor)
      await guiaEstadoService.cambiarEstado(cedula, nuevoEstado);
      
      // Mostrar alerta de cambio de estado
      setMostrarAlerta(true);
      
      // Ocultar la alerta después de 5 segundos
      setTimeout(() => setMostrarAlerta(false), 5000);
      
      // Notificar al componente padre si existe callback
      if (onChangeEstado) {
        onChangeEstado(nuevoEstado);
      }
      
      // Emitir evento global para la alerta
      window.dispatchEvent(new CustomEvent('guiaEstadoCambiado', {
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
  
  // Estilo original del Selector_Estado_Ope
  return (
    <>
      <div className="relative">
        {/* Botón principal que muestra el estado actual (estilo original) */}
        <button
          onClick={() => setMostrarSelector(!mostrarSelector)}
          disabled={cargando}
          className={`flex items-center justify-between px-4 py-2 rounded-lg text-white font-medium min-w-[120px] transition-all duration-200 ${config.buttonClass} ${cargando ? 'opacity-70' : ''}`}
        >
          <span>{config.label}</span>
          <ChevronDown className={`ml-2 w-5 h-5 transition-transform duration-200 ${mostrarSelector ? 'transform rotate-180' : ''}`} />
        </button>

        {/* Menú desplegable (estilo original) */}
        {mostrarSelector && (
          <div className="absolute right-0 mt-2 w-full min-w-[120px] rounded-lg shadow-lg z-50 overflow-hidden transition-all duration-200 transform origin-top scale-100">
            {Object.entries(ESTADOS_CONFIG).map(([estadoKey, estadoConfig]) => (
              <button
                key={estadoKey}
                onClick={() => cambiarEstado(estadoKey)}
                className={`w-full text-center py-2 px-4 text-white font-medium ${estadoConfig.buttonClass} ${estado === estadoKey ? 'opacity-70' : ''}`}
                disabled={estado === estadoKey || cargando}
              >
                {estadoConfig.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Alerta de cambio de estado */}
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

export default EstadoGuia; 