import React, { useState, useEffect } from 'react';
import { Check, BellRing, Ban, X } from 'lucide-react';

// Configuración de estilos para cada estado
const ESTADOS_CONFIG = {
  disponible: {
    icon: <Check className="w-5 h-5" />,
    alertClass: 'bg-blue-50 border-blue-200 text-blue-800',
    label: 'Disponible'
  },
  ocupado: {
    icon: <BellRing className="w-5 h-5" />,
    alertClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    label: 'Ocupado'
  },
  inactivo: {
    icon: <Ban className="w-5 h-5" />,
    alertClass: 'bg-red-50 border-red-200 text-red-800',
    label: 'Inactivo'
  }
};

const AlertasEstado = () => {
  const [alertas, setAlertas] = useState([]);
  
  useEffect(() => {
    // Escuchar cambios de estado de guías
    const handleCambioEstadoGuia = (event) => {
      const { cedula, nombre, nuevoEstado } = event.detail;
      
      // Crear nueva alerta
      const nuevaAlerta = {
        id: Date.now(),
        cedula,
        nombre,
        estado: nuevoEstado
      };
      
      // Añadir a la lista de alertas
      setAlertas(prev => [...prev, nuevaAlerta]);
      
      // Auto-eliminar después de 5 segundos
      setTimeout(() => {
        setAlertas(prev => prev.filter(alerta => alerta.id !== nuevaAlerta.id));
      }, 5000);
    };
    
    window.addEventListener('guiaEstadoCambiado', handleCambioEstadoGuia);
    
    return () => {
      window.removeEventListener('guiaEstadoCambiado', handleCambioEstadoGuia);
    };
  }, []);
  
  // Si no hay alertas, no renderizar nada
  if (!alertas.length) return null;
  
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-2">
      {alertas.map(alerta => {
        const config = ESTADOS_CONFIG[alerta.estado] || ESTADOS_CONFIG.disponible;
        return (
          <div 
            key={alerta.id}
            className={`flex items-center p-4 rounded-lg border ${config.alertClass} shadow-md transition-all duration-300 animate-fade-in-down`}
          >
            {config.icon}
            <span className="ml-2 font-medium">
              {alerta.nombre 
                ? `El estado de ${alerta.nombre} ha cambiado a ${config.label}`
                : `Estado del guía cambiado a ${config.label}`}
            </span>
            <button
              type="button"
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-opacity-20"
              onClick={() => setAlertas(prev => prev.filter(a => a.id !== alerta.id))}
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AlertasEstado; 