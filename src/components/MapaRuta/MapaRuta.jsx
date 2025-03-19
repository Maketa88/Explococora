import React, { useState } from 'react';
import { geocodeAddress } from '../../services/mapboxService';
import MapboxMap from './components/MapaMapbox';

const MapaRuta = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (type) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const address = type === 'origin' ? originAddress : destinationAddress;
      const response = await geocodeAddress(address);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      if (type === 'origin') {
        setOrigin(response.data);
      } else {
        setDestination(response.data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteUpdate = (info) => {
    setRouteInfo(info);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      padding: '20px',
      gap: '20px'
    }}>
      <div style={{
        display: 'flex',
        gap: '20px',
        padding: '20px',
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={originAddress}
            onChange={(e) => setOriginAddress(e.target.value)}
            placeholder="Dirección de origen"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          />
          <button
            onClick={() => handleSearch('origin')}
            disabled={isLoading}
            style={{
              marginTop: '5px',
              padding: '10px 20px',
              background: '#3887fc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            Buscar origen
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder="Dirección de destino"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          />
          <button
            onClick={() => handleSearch('destination')}
            disabled={isLoading}
            style={{
              marginTop: '5px',
              padding: '10px 20px',
              background: '#3887fc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            Buscar destino
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '5px'
        }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, position: 'relative' }}>
        <MapboxMap
          origin={origin}
          destination={destination}
          onRouteUpdate={handleRouteUpdate}
          onError={setError}
        />
      </div>

      {routeInfo && (
        <div style={{
          padding: '20px',
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Información de la ruta:</h3>
          <p>Distancia: {(routeInfo.distance / 1000).toFixed(2)} km</p>
          <p>Duración: {Math.round(routeInfo.duration / 60)} minutos</p>
        </div>
      )}
    </div>
  );
};

export default MapaRuta; 