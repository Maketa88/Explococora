import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { CardGuia } from './Card';

/**
 * Componente que muestra una lista de guías con filtrado por estado
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.guias - Lista de guías a mostrar
 */
const CardList = ({ guias }) => {
  
  // Filtrar guías por estado usando useMemo para optimizar rendimiento
  const guiasFiltrados = useMemo(() => {
    if (!guias || guias.length === 0) return [];
    // Siempre devolvemos todos los guías ya que no hay filtro por estado
    return guias;
  }, [guias]);

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
      {/* Botón de filtro por estado - Versión simplificada */}
      <div className="flex justify-center mb-10 max-w-6xl mx-auto px-4">
        <div className="relative flex-1 max-w-md min-h-[100px] px-6 py-5 rounded-xl bg-teal-800 text-white shadow-xl z-10">
          {/* Efecto de fondo */}
          <span className="absolute inset-0 overflow-hidden">
            <span className="absolute -inset-[10px] bg-teal-700 rounded-full blur-xl opacity-50"></span>
          </span>
          
          {/* Contenedor principal */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            {/* Círculo decorativo para el icono */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 bg-white text-teal-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            
            {/* Texto del botón */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <span className="font-bold text-lg text-white drop-shadow-sm">Todos los Guías</span>
              <span className="text-xs text-white font-medium drop-shadow-sm brightness-150">
                Ver todos los guías registrados
              </span>
            </div>
          </div>
          
          {/* Indicador de selección */}
          <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-white rounded-full"></span>
        </div>
      </div>

      {/* Lista de guías filtradas */}
      {guiasFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay guías disponibles.</p>
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

