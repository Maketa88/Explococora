import React, { useEffect, useState } from 'react';
import MapboxMap from './MapaMapbox';

/**
 * Componente de integración para usar el mapa de Mapbox
 * en el componente ResultadoRuta
 */
const MapaRutaIntegracion = ({ rutaPrincipal, altura = '400px' }) => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    // Si tenemos datos de ruta, preparamos los puntos de origen y destino
    if (rutaPrincipal && rutaPrincipal.coordenadas) {
      try {
        // Formato esperado por el componente MapboxMap
        const puntos = rutaPrincipal.coordenadas;
        
        // Si tenemos al menos un punto de inicio y fin
        if (puntos && puntos.length >= 2) {
          // El origen es el primer punto
          const origenPunto = {
            lng: puntos[0][0],  // Longitud
            lat: puntos[0][1]   // Latitud
          };
          
          // El destino es el último punto
          const destinoPunto = {
            lng: puntos[puntos.length - 1][0],  // Longitud
            lat: puntos[puntos.length - 1][1]   // Latitud
          };
          
          setOrigin(origenPunto);
          setDestination(destinoPunto);
        } else {
          setError('La ruta no tiene suficientes puntos para mostrar');
        }
      } catch (err) {
        console.error('Error al procesar datos de ruta:', err);
        setError('Error al procesar los datos de la ruta');
      }
    }
  }, [rutaPrincipal]);

  const handleRouteUpdate = (info) => {
    setRouteInfo(info);
  };

  return (
    <div style={{ 
      width: '100%', 
      height: altura, 
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginTop: '20px',
      marginBottom: '20px'
    }}>
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,235,238,0.9)',
          padding: '15px 20px',
          borderRadius: '5px',
          zIndex: 10,
          maxWidth: '80%'
        }}>
          {error}
        </div>
      )}
      
      <MapboxMap 
        origin={origin}
        destination={destination}
        onRouteUpdate={handleRouteUpdate}
        onError={setError}
      />
    </div>
  );
};

export default MapaRutaIntegracion; 