import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import { getRouteDirections } from '../../../services/mapboxService';
import { MAPBOX_CONFIG } from '../config/mapboxConfig';

const MapboxMap = ({ 
  origin, 
  destination, 
  onRouteUpdate, 
  onError 
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      ...MAPBOX_CONFIG.defaultOptions
    });

    map.current.on('load', () => {
      setIsLoading(false);
      if (origin && destination) {
        updateRoute();
      }
    });

    map.current.on('error', (e) => {
      console.error('Error en el mapa:', e);
      onError && onError('Error al cargar el mapa');
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const updateRoute = async () => {
    try {
      const response = await getRouteDirections(origin, destination);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      const route = response.data.routes[0];
      const coordinates = route.geometry.coordinates;

      // Eliminar capas existentes si las hay
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Añadir la nueva ruta
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887fc',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });

      // Ajustar el mapa para mostrar toda la ruta
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, {
        padding: 50
      });

      // Enviar información de la ruta al componente padre
      onRouteUpdate && onRouteUpdate({
        distance: route.distance,
        duration: route.duration,
        steps: route.legs[0].steps
      });

    } catch (error) {
      console.error('Error al actualizar la ruta:', error);
      onError && onError(error.message || 'Error al obtener la ruta');
    }
  };

  useEffect(() => {
    if (map.current && origin && destination) {
      updateRoute();
    }
  }, [origin, destination]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%'
        }}
      />
      
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px 20px',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 5
        }}>
          Cargando mapa...
        </div>
      )}
    </div>
  );
};

export default MapboxMap; 