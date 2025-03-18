import { useState } from 'react';
import MapaAzure from './MapaAzure';

/**
 * Componente de demostración para probar el mapa de Azure Maps
 */
export const DemoMapa = () => {
  // Estados
  const [mapaListo, setMapaListo] = useState(false);
  
  // Coordenadas para centrar el mapa en Colombia
  const centro = [-74.297, 4.711]; // Bogotá, Colombia
  
  // Manejador para cuando el mapa esté listo
  const handleMapaListo = (iframe) => {
    console.log('¡Mapa listo!', iframe);
    setMapaListo(true);
    
    // La nueva implementación usa iframe, así que no podemos manipular directamente el mapa
    // Los marcadores y clicks se manejarían en el iframe interno
  };
  
  // Manejador para errores del mapa
  const handleMapaError = (error) => {
    console.error('Error en el mapa:', error);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">
        Demostración Básica del Mapa de Azure
      </h1>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Vista Simple del Mapa de Colombia
          </h2>
          <p className="text-gray-600">
            Versión simplificada para probar la integración con Azure Maps
          </p>
          
          {/* Mostrar estado del mapa */}
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${mapaListo ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {mapaListo ? 'Mapa inicializado' : 'Inicializando mapa...'}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <MapaAzure
            altura="600px"
            centro={centro}
            zoom={6}
            estilo="road"
            mostrarControles={true}
            onMapaListo={handleMapaListo}
            onError={handleMapaError}
            className="rounded-lg"
          />
        </div>
        
        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-500">
            Este es un componente de demostración para verificar que la integración con Azure Maps funcione correctamente.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            <strong>Tip:</strong> Esta versión usa un iframe aislado para mayor compatibilidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoMapa; 