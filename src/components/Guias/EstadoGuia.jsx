import React, { useState, useEffect } from 'react';
import { Check, BellRing, Ban, ChevronDown, X } from 'lucide-react';
import guiaEstadoService from '../../services/guiaEstadoService';

// Configuración de colores y estilos para cada estado - estilo call center como el original
const ESTADOS_CONFIG = {
  disponible: {
    color: '#16A34A', // verde-600
    bgColor: '#DCFCE7', // verde-50
    borderColor: '#22C55E', // verde-500
    buttonClass: 'bg-green-500 hover:bg-green-600',
    alertClass: 'bg-green-50 border-green-200 text-green-700',
    icon: <Check className="w-4 h-4 text-green-500" />,
    label: 'Disponible'
  },
  ocupado: {
    color: '#D97706', // amber-600
    bgColor: '#FEF3C7', // amber-50
    borderColor: '#F59E0B', // amber-500
    buttonClass: 'bg-amber-500 hover:bg-amber-600',
    alertClass: 'bg-amber-50 border-amber-200 text-amber-700',
    icon: <BellRing className="w-4 h-4 text-amber-500" />,
    label: 'Ocupado'
  },
  inactivo: {
    color: '#DC2626', // red-600
    bgColor: '#FEE2E2', // red-50
    borderColor: '#EF4444', // red-500
    buttonClass: 'bg-red-500 hover:bg-red-600',
    alertClass: 'bg-red-50 border-red-200 text-red-700',
    icon: <Ban className="w-4 h-4 text-red-500" />,
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
  
  // Renderizar según el tamaño solicitado
  if (tamanio === 'boton') {
    return (
      <>
        <button 
          onClick={() => setMostrarSelector(!mostrarSelector)}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium ${config.buttonClass} text-white`}
        >
          {config.label}
        </button>
        
        {mostrarSelector && (
          <div className="absolute left-0 right-0 bottom-full mb-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
            <div className="py-1">
              {Object.entries(ESTADOS_CONFIG).map(([estadoKey, estadoConfig]) => (
                <button 
                  key={estadoKey}
                  onClick={() => cambiarEstado(estadoKey)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{ color: estadoConfig.color }}
                  disabled={estado === estadoKey || cargando}
                >
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
            estado === 'disponible' ? 'bg-green-100 text-green-600' : 
            estado === 'ocupado' ? 'bg-amber-100 text-amber-600' : 
            'bg-red-100 text-red-600'
          }`}
          onClick={() => setMostrarSelector(!mostrarSelector)}
        >
          {config.icon && <span className="mr-1">{config.icon}</span>}
          {config.label}
        </div>
        
        {mostrarSelector && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-100">
            <div className="py-1">
              <button 
                onClick={() => cambiarEstado('disponible')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-green-50 flex items-center border-b border-gray-100"
                disabled={estado === 'disponible' || cargando}
              >
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-green-600">Disponible</span>
              </button>
              
              <button 
                onClick={() => cambiarEstado('ocupado')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-amber-50 flex items-center border-b border-gray-100"
                disabled={estado === 'ocupado' || cargando}
              >
                <BellRing className="w-4 h-4 text-amber-500 mr-2" />
                <span className="text-amber-600">Ocupado</span>
              </button>
              
              <button 
                onClick={() => cambiarEstado('inactivo')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center"
                disabled={estado === 'inactivo' || cargando}
              >
                <Ban className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-red-600">Inactivo</span>
              </button>
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

export default EstadoGuia; 