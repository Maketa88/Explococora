

/**
 * Componente para mostrar información detallada de una ruta
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element}
 */
const InfoRuta = ({ 
  datosRuta, 
  className = '', 
  mostrarInstrucciones = true,
  mostrarResumen = true
}) => {
  // Validación de datos completa
  if (!datosRuta || !datosRuta.routes || !Array.isArray(datosRuta.routes) || datosRuta.routes.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <p className="text-gray-500 text-center">
          No hay información disponible para esta ruta.
        </p>
      </div>
    );
  }

  // Obtener datos de la primera ruta (normalmente la más óptima)
  const ruta = datosRuta.routes[0] || {};
  const resumen = ruta.summary || {};
  
  // Validación adicional para tramos y instrucciones
  const tramos = Array.isArray(ruta.legs) ? ruta.legs : [];
  const tramo = tramos.length > 0 ? tramos[0] : {};
  const instrucciones = Array.isArray(tramo.instructions) ? tramo.instructions : [];

  // Función para formatear la duración en formato legible
  const formatearDuracion = (segundos) => {
    if (typeof segundos !== 'number' || segundos <= 0) return 'Desconocido';
    
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    
    if (horas > 0) {
      return `${horas} h ${minutos} min`;
    }
    return `${minutos} min`;
  };

  // Función para formatear la distancia en formato legible
  const formatearDistancia = (metros) => {
    if (typeof metros !== 'number' || metros <= 0) return 'Desconocido';
    
    if (metros < 1000) {
      return `${metros} m`;
    }
    return `${(metros / 1000).toFixed(1)} km`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Resumen de la ruta */}
      {mostrarResumen && (
        <div className="bg-gradient-to-r from-teal-500 to-teal-700 text-white p-4">
          <h3 className="text-lg font-semibold mb-2">Resumen de la ruta</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-teal-100">Distancia total:</span>
              <p className="text-white font-bold text-xl">
                {formatearDistancia(resumen.lengthInMeters)}
              </p>
            </div>
            <div>
              <span className="text-teal-100">Tiempo estimado:</span>
              <p className="text-white font-bold text-xl">
                {formatearDuracion(resumen.travelTimeInSeconds)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones de la ruta */}
      {mostrarInstrucciones && instrucciones.length > 0 ? (
        <div className="p-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">
            Indicaciones paso a paso
          </h4>
          <ol className="space-y-3">
            {instrucciones.map((instruccion, idx) => (
              <li key={idx} className="flex items-start p-2 border-b border-gray-100 last:border-0">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mr-3 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-gray-700">{instruccion.text || 'Indicación no disponible'}</p>
                  {instruccion.routeOffsetInMeters && (
                    <span className="text-xs text-gray-500">
                      {formatearDistancia(instruccion.routeOffsetInMeters)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : mostrarInstrucciones && (
        <div className="p-4 text-center text-gray-500">
          <p>No hay indicaciones paso a paso disponibles para esta ruta.</p>
        </div>
      )}
    </div>
  );
};

export default InfoRuta; 