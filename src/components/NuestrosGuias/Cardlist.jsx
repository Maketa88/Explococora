import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { CardGuia } from './Card';

/**
 * Componente que muestra una lista de guías con filtrado por estado
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.guias - Lista de guías a mostrar
 */
const CardList = ({ guias }) => {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Filtrar guías por estado usando useMemo para optimizar rendimiento
  const guiasFiltrados = useMemo(() => {
    if (!guias || guias.length === 0) return [];
    if (filtroEstado === 'todos') return guias;
    
    // Filtrado para trabajar con los valores exactos de la base de datos
    return guias.filter(guia => {
      const estadoGuia = (guia.estado || '').toLowerCase();
      const filtroEstadoLower = filtroEstado.toLowerCase();
      
      // Comparación exacta con el valor de la base de datos
      return estadoGuia === filtroEstadoLower;
    });
  }, [guias, filtroEstado]);

  // Configuración de los botones de filtro - Ajustados para los tres estados
  const botonesEstado = [
    { 
      id: 'todos', 
      texto: 'Todos los Guías', 
      descripcion: 'Ver todos los guías registrados',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    { 
      id: 'disponible', 
      texto: 'Guías Disponibles', 
      descripcion: 'Guías listos para servicio',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    { 
      id: 'ocupado', 
      texto: 'Guías Ocupados', 
      descripcion: 'Guías en servicio actualmente',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'inactivo', 
      texto: 'Guías Inactivos', 
      descripcion: 'Guías temporalmente fuera de servicio',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )
    }
  ];
  
  // Si no hay guías, mostrar mensaje
  if (!guias || guias.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay guías disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Botones de filtro por estado - Versión mejorada y 100% responsiva */}
      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-4 mb-10 max-w-6xl mx-auto px-4">
        {botonesEstado.map((boton) => {
          const esSeleccionado = filtroEstado === boton.id;
          
          return (
            <button
              key={boton.id}
              type="button"
              className={`
                relative flex-1 min-h-[100px] px-6 py-5 rounded-xl transition-all duration-300 ease-in-out
                flex items-center justify-center gap-3 shadow-lg
                ${esSeleccionado 
                  ? 'bg-teal-800 text-white transform scale-105 shadow-xl z-10' 
                  : 'bg-white text-teal-800 border-2 border-teal-800/20 hover:border-teal-800 hover:bg-teal-50'
                }
                group overflow-hidden
              `}
              onClick={() => setFiltroEstado(boton.id)}
            >
              {/* Efecto de fondo al seleccionar */}
              {esSeleccionado && (
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute -inset-[10px] bg-teal-700 rounded-full blur-xl opacity-50"></span>
                </span>
              )}
              
              {/* Contenedor principal para mejor organización en responsive */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                {/* Círculo decorativo para el icono */}
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full shrink-0
                  ${esSeleccionado 
                    ? 'bg-white text-teal-800' 
                    : 'bg-teal-100 text-teal-800 group-hover:bg-teal-200'
                  }
                  transition-all duration-300
                `}>
                  {boton.icon}
                </div>
                
                {/* Texto del botón */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span className={`font-bold text-lg ${esSeleccionado ? 'text-white drop-shadow-sm' : ''}`}>{boton.texto}</span>
                  <span className={`text-xs ${esSeleccionado ? 'text-white font-medium drop-shadow-sm brightness-150' : 'text-teal-600'}`}>
                    {boton.descripcion}
                  </span>
                </div>
              </div>
              
              {/* Indicador de selección */}
              {esSeleccionado && (
                <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-white rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de guías filtradas */}
      {guiasFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay guías con el estado seleccionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
          {guiasFiltrados.map((guia, index) => (
            <CardGuia key={guia.id || guia.cedula || index} guia={guia} />
          ))}
        </div>
      )}
    </div>
  );
};

CardList.propTypes = {
  guias: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      cedula: PropTypes.string,
      primerNombre: PropTypes.string,
      estado: PropTypes.string
    })
  ).isRequired
};

export { CardList };

