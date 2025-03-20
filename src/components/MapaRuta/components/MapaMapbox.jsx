import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  
  // Coordenadas del Valle del Cocora
  const defaultCenter = useMemo(() => [-75.4893, 4.6386], []);
  const defaultZoom = 13;

  const updateRoute = useCallback(async () => {
    try {
      const response = await getRouteDirections(origin, destination);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      const route = response.data.routes[0];
      
      // Verificar que route y route.geometry existan
      if (!route || !route.geometry || !route.geometry.coordinates || !Array.isArray(route.geometry.coordinates) || route.geometry.coordinates.length === 0) {
        throw new Error('La respuesta de la ruta no contiene coordenadas válidas');
      }
      
      const coordinates = route.geometry.coordinates;

      // Eliminar capas existentes si las hay
      if (map.current.getSource('route')) {
        map.current.removeLayer('route-glow');
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Añadir la nueva ruta con efectos visuales avanzados
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
          'line-color': '#FF5733',  // Color llamativo
          'line-width': 6,
          'line-opacity': 0.9,
          'line-blur': 1,           // Efecto de desenfoque
          'line-dasharray': [0.5, 0.5]  // Línea discontinua
        }
      });

      // Añadir capa de resplandor para el sendero
      map.current.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FFC300',  // Color del resplandor
          'line-width': 12,
          'line-opacity': 0.3,
          'line-blur': 3
        },
        filter: ['==', '$type', 'LineString']
      }, 'route');

      // Ajustar el mapa para mostrar toda la ruta
      try {
        if (coordinates.length >= 2) {
          const bounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
          
          // Extender los límites para incluir todas las coordenadas
          for (let i = 1; i < coordinates.length; i++) {
            bounds.extend(coordinates[i]);
          }
          
          map.current.fitBounds(bounds, {
            padding: 50
          });
        } else {
          // Si solo hay una coordenada, centrar el mapa en ese punto
          map.current.flyTo({
            center: coordinates[0],
            zoom: defaultZoom
          });
        }
      } catch (boundError) {
        console.error('Error al ajustar los límites del mapa:', boundError);
        // Fallback a la vista predeterminada
        map.current.flyTo({
          center: defaultCenter,
          zoom: defaultZoom
        });
      }

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
  }, [origin, destination, onRouteUpdate, onError, defaultCenter, defaultZoom]);

  const setupTerrainAndLighting = useCallback(() => {
    if (!map.current) return;

    try {
      // Añadir fuente de terreno para el terreno 3D
      if (!map.current.getSource('mapbox-dem')) {
        map.current.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
      }

      // Añadir fuente de terreno separada para el sombreado
      if (!map.current.getSource('mapbox-dem-hillshade')) {
        map.current.addSource('mapbox-dem-hillshade', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
      }

      // Añadir capa de terreno con exageración de relieve
      map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      // Configurar iluminación para mejorar la percepción del terreno
      map.current.setLights([
        {
          'id': 'directional-light',
          'type': 'directional',
          'properties': {
            'color': '#ffffff',
            'intensity': 0.4
          }
        },
        {
          'id': 'ambient-light',
          'type': 'ambient',
          'properties': {
            'color': '#ffffff',
            'intensity': 0.2
          }
        }
      ]);

      // Añadir capa de sombras usando la fuente dedicada para hillshade
      if (!map.current.getLayer('hillshading')) {
        map.current.addLayer({
          'id': 'hillshading',
          'source': 'mapbox-dem-hillshade',
          'type': 'hillshade',
          'paint': {
            'hillshade-accent-color': '#5a5a5a',
            'hillshade-highlight-color': '#ffffff',
            'hillshade-illumination-direction': 270,
            'hillshade-illumination-anchor': 'viewport',
            'hillshade-shadow-color': '#3a3a3a'
          }
        });
      }

      // Añadir senderos destacados
      if (!map.current.getSource('trails')) {
        const trailsData = {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'properties': {
                'name': 'Sendero Palmas de Cera',
                'difficulty': 'Moderado'
              },
              'geometry': {
                'type': 'LineString',
                'coordinates': [
                  [-75.4893, 4.6386],
                  [-75.4950, 4.6415],
                  [-75.4980, 4.6450],
                  [-75.5010, 4.6475],
                  [-75.5050, 4.6500]
                ]
              }
            },
            {
              'type': 'Feature',
              'properties': {
                'name': 'Mirador Valle del Cocora',
                'difficulty': 'Fácil'
              },
              'geometry': {
                'type': 'LineString',
                'coordinates': [
                  [-75.4893, 4.6386],
                  [-75.4860, 4.6400],
                  [-75.4830, 4.6420],
                  [-75.4800, 4.6440]
                ]
              }
            }
          ]
        };

        map.current.addSource('trails', {
          'type': 'geojson',
          'data': trailsData
        });

        map.current.addLayer({
          'id': 'trails-layer',
          'type': 'line',
          'source': 'trails',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#32CD32',
            'line-width': 5,
            'line-opacity': 0.8,
            'line-blur': 0.5
          }
        });
      }

      // Añadir marcadores en los puntos de interés
      try {
        const poiLocations = [
          { name: 'Mirador Principal', coordinates: [-75.4893, 4.6386] },
          { name: 'Palmas de Cera', coordinates: [-75.5010, 4.6475] },
          { name: 'Cascada', coordinates: [-75.4800, 4.6440] }
        ];

        poiLocations.forEach(poi => {
          if (!poi || !poi.coordinates || !Array.isArray(poi.coordinates) || poi.coordinates.length < 2) return;
          
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundImage = 'url(https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png)';
          el.style.width = '32px';
          el.style.height = '32px';
          el.style.backgroundSize = 'cover';
          el.style.cursor = 'pointer';

          new mapboxgl.Marker(el)
            .setLngLat(poi.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${poi.name}</h3>`))
            .addTo(map.current);
        });
      } catch (markerError) {
        console.error('Error al añadir marcadores:', markerError);
      }

      // Añadir edificios 3D si están disponibles en el mapa base
      try {
        if (!map.current.getLayer('3d-buildings')) {
          const layers = map.current.getStyle().layers;
          if (!layers || !Array.isArray(layers)) return;
          
          let labelLayerId;

          // Encontrar la primera capa de etiquetas para insertar el edificio 3D debajo
          for (let i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol' && layers[i].layout && layers[i].layout['text-field']) {
              labelLayerId = layers[i].id;
              break;
            }
          }

          if (labelLayerId) {
            map.current.addLayer({
              'id': '3d-buildings',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 14,
              'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                  'interpolate', ['linear'], ['zoom'],
                  14, 0,
                  16, ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate', ['linear'], ['zoom'],
                  14, 0,
                  16, ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
              }
            }, labelLayerId);
          }
        }
      } catch (buildingError) {
        console.error('Error al añadir edificios 3D:', buildingError);
      }
    } catch (error) {
      console.error('Error en la configuración del terreno e iluminación:', error);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',  // Estilo satelital con calles
      center: origin ? origin : defaultCenter,
      zoom: defaultZoom,
      pitch: 60,  // Inclinación para vista 3D
      bearing: 30,  // Rotación para mejor perspectiva
      antialias: true  // Para un renderizado más suave
    });

    // Añadir controles de navegación mejorados
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());
    map.current.addControl(new mapboxgl.ScaleControl());
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }));

    map.current.on('load', () => {
      setupTerrainAndLighting();
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
  }, [origin, destination, onError, updateRoute, setupTerrainAndLighting, defaultCenter]);

  useEffect(() => {
    if (map.current && origin && destination) {
      updateRoute();
    }
  }, [origin, destination, updateRoute]);

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
          Cargando mapa 3D...
        </div>
      )}
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 5
      }}>
        Valle del Cocora - Experiencia 3D
      </div>
    </div>
  );
};

export default MapboxMap;
