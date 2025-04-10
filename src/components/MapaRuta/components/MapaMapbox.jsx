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
        const routePoints = [
          { 
            name: 'Inicio de Ruta', 
            coordinates: [-75.486686, 4.638081],
            type: 'start',
            description: 'Punto de partida del recorrido en Bosques De Cocora',
            imageUrl: 'https://images.pexels.com/photos/5342982/pexels-photo-5342982.jpeg'
          },
          { 
            name: 'Manos de Cocora Mirador', 
            coordinates: [-75.48228, 4.64217],
            type: 'poi',
            description: 'Mirador elevado con vistas excepcionales a todo el valle',
            imageUrl: 'https://images.pexels.com/photos/5342980/pexels-photo-5342980.jpeg'
          },
          { 
            name: 'Forest of the Palms', 
            coordinates: [-75.48172, 4.63972],
            type: 'poi',
            description: 'Bosque de palmas de cera, el árbol nacional de Colombia',
            imageUrl: 'https://images.pexels.com/photos/5342978/pexels-photo-5342978.jpeg'
          },
          { 
            name: 'Mirador Valle del Cocora', 
            coordinates: [-75.47648, 4.63675],
            type: 'poi',
            description: 'Mirador con vista panorámica del valle',
            imageUrl: 'https://images.pexels.com/photos/5342976/pexels-photo-5342976.jpeg'
          },
          { 
            name: 'Fin de Ruta', 
            coordinates: [-75.47087, 4.63529],
            type: 'end',
            description: 'Punto final del recorrido en el Valle del Cocora',
            imageUrl: 'https://images.pexels.com/photos/5342974/pexels-photo-5342974.jpeg'
          }
        ];

        routePoints.forEach(point => {
          if (!point || !point.coordinates || !Array.isArray(point.coordinates) || point.coordinates.length < 2) return;
          
          const el = document.createElement('div');
          el.className = `marker marker-${point.type}`;
          el.style.backgroundImage = 'url(https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png)';
          el.style.width = 'clamp(30px, 4vw, 40px)';
          el.style.height = 'clamp(30px, 4vw, 40px)';
          el.style.backgroundSize = 'cover';
          el.style.cursor = 'pointer';
          
          // Añadir estilos específicos según el tipo de punto
          switch(point.type) {
            case 'start':
              el.style.filter = 'hue-rotate(120deg)'; // Verde
              break;
            case 'poi':
              el.style.filter = 'hue-rotate(210deg)'; // Azul
              break;
            case 'end':
              el.style.filter = 'hue-rotate(0deg)'; // Rojo
              break;
          }

          // Crear el contenido del popup
          const getPopupContent = (zoom) => {
            // Ajustar tamaños según el zoom
            const containerWidth = zoom < 13 ? 'min(60vw, 200px)' : 'min(70vw, 250px)';
            const imageHeight = zoom < 13 ? '120px' : '150px';
            const titleSize = zoom < 13 ? '14px' : '16px';
            const descSize = zoom < 13 ? '11px' : '12px';
            const padding = zoom < 13 ? '6px' : '8px';

            return `
              <div style="
                text-align: center;
                width: ${containerWidth};
                max-height: ${zoom < 13 ? '50vh' : '60vh'};
                overflow-y: auto;
                box-sizing: border-box;
                padding: ${padding};
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(8px);
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.15);
              ">
                <h3 style="
                  margin: 0;
                  color: #333;
                  padding: 4px 0;
                  font-size: ${titleSize};
                  font-weight: 600;
                  border-bottom: 1px solid #eee;
                ">${point.name}</h3>
                
                <div style="
                  position: relative;
                  width: 100%;
                  height: ${imageHeight};
                  margin: 6px 0;
                  border-radius: 6px;
                  overflow: hidden;
                  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
                ">
                  <img 
                    src="${point.imageUrl}" 
                    style="
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                    "
                    alt="${point.name}"
                    onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'"
                  />
                </div>

                <div style="
                  padding: 4px;
                  background: rgba(255,255,255,0.8);
                  border-radius: 4px;
                ">
                  <p style="
                    margin: 0 0 3px 0;
                    color: #444;
                    font-size: ${descSize};
                    line-height: 1.3;
                  ">${point.description}</p>

                  <p style="
                    margin: 0;
                    color: #666;
                    font-size: ${parseInt(descSize) - 1}px;
                    font-style: italic;
                  ">
                    ${point.type === 'start' ? '🚩' :
                      point.type === 'end' ? '🏁' :
                      '📍'}
                  </p>
                </div>
              </div>
            `;
          };

          // Crear el popup
          const popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: 'none',
            className: 'centered-popup',
            anchor: 'center',
            offset: [0, 0]
          });

          // Añadir el marcador al mapa
          new mapboxgl.Marker(el)
            .setLngLat(point.coordinates)
            .addTo(map.current);

          // Añadir evento de clic al marcador
          el.addEventListener('click', () => {
            // Cerrar cualquier popup existente
            const existingPopups = document.getElementsByClassName('mapboxgl-popup');
            Array.from(existingPopups).forEach(popup => popup.remove());
            
            // Obtener el zoom actual
            const currentZoom = map.current.getZoom();
            
            // Actualizar el contenido del popup según el zoom
            popup.setHTML(getPopupContent(currentZoom));
            
            // Obtener el centro del mapa
            const center = map.current.getCenter();
            
            // Mostrar el popup en el centro del mapa
            popup.setLngLat(center);
            popup.addTo(map.current);

            // Ajustar la vista del mapa
            map.current.easeTo({
              center: center,
              duration: 1000,
              zoom: currentZoom < 14 ? 14 : currentZoom
            });
          });
        });

        // Actualizar la ruta para que pase por todos los puntos
        if (map.current.getSource('trails')) {
          const updatedTrailsData = {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'properties': {
                  'name': 'Ruta Circular Valle del Cocora',
                  'difficulty': 'Moderado'
                },
                'geometry': {
                  'type': 'LineString',
                  'coordinates': routePoints.map(point => point.coordinates)
                }
              }
            ]
          };

          map.current.getSource('trails').setData(updatedTrailsData);
        }

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
            // Capa base de edificios
            map.current.addLayer({
              'id': '3d-buildings-base',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 11,
              'paint': {
                // Esquema de color mejorado para casas de estilo colonial/tradicional
                'fill-extrusion-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'height'],
                  0, '#FCF3CF', // Amarillo muy claro para casas pequeñas
                  5, '#F5EEF8', // Blanco con tinte púrpura para casas medianas
                  10, '#F9E79F', // Amarillo más intenso para casas grandes
                  15, '#FDEBD0'  // Beige cálido para edificios más altos
                ],
                // Altura uniforme simplificada
                'fill-extrusion-height': [
                  'case',
                  ['has', 'height'],
                  ['get', 'height'],
                  8 // Altura fija para todas las casas
                ],
                // Base de los edificios
                'fill-extrusion-base': [
                  'case',
                  ['has', 'min_height'],
                  ['get', 'min_height'],
                  0
                ],
                'fill-extrusion-opacity': 0.95,
                'fill-extrusion-vertical-gradient': true,
                'fill-extrusion-height-transition': {
                  duration: 800,
                  delay: 0
                }
              }
            }, labelLayerId);

            // Capa de paredes con detalles
            map.current.addLayer({
              'id': '3d-buildings-walls',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 14,
              'paint': {
                'fill-extrusion-color': '#FFFFFF', // Paredes blancas
                'fill-extrusion-height': [
                  'case',
                  ['has', 'height'],
                  ['get', 'height'],
                  7.5 // Altura fija para edificios sin altura definida
                ],
                'fill-extrusion-base': [
                  'case',
                  ['has', 'min_height'],
                  ['get', 'min_height'],
                  0
                ],
                'fill-extrusion-opacity': 0.9,
                'fill-extrusion-vertical-gradient': true,
                'fill-extrusion-translate': [0.2, 0.2],
                'fill-extrusion-translate-anchor': 'viewport'
              }
            }, '3d-buildings-base');

            // Techos con color terracota y detalles
            map.current.addLayer({
              'id': 'building-roofs',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 13,
              'paint': {
                'fill-extrusion-color': '#C0392B', // Rojo terracota
                'fill-extrusion-height': [
                  'case',
                  ['has', 'height'],
                  ['+', ['get', 'height'], 0.8],
                  8.8 // Altura fija + 0.8 para el techo
                ],
                'fill-extrusion-base': [
                  'case',
                  ['has', 'height'],
                  ['get', 'height'],
                  8 // Altura base fija
                ],
                'fill-extrusion-opacity': 0.95,
                'fill-extrusion-vertical-gradient': true
              }
            }, '3d-buildings-walls');

            // Detalle para ventanas y detalles de fachada
            map.current.addLayer({
              'id': 'building-windows',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 16, // Solo visible muy de cerca
              'paint': {
                'fill-extrusion-color': '#85C1E9', // Color azul claro para ventanas
                'fill-extrusion-height': [
                  'case',
                  ['has', 'height'],
                  ['-', ['get', 'height'], 0.2],
                  7.8 // Altura fija - 0.2 para ventanas
                ],
                'fill-extrusion-base': [
                  'case',
                  ['has', 'min_height'],
                  ['+', ['get', 'min_height'], 1.5],
                  1.5
                ],
                'fill-extrusion-opacity': 0.7,
                'fill-extrusion-vertical-gradient': false,
                'fill-extrusion-translate': [0.1, 0.1],
                'fill-extrusion-translate-anchor': 'map'
              }
            }, 'building-roofs');

            // Sombras mejoradas para mayor realismo
            map.current.addLayer({
              'id': 'building-shadows',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 12,
              'paint': {
                'fill-extrusion-color': '#000000',
                'fill-extrusion-height': [
                  'case',
                  ['has', 'height'],
                  ['get', 'height'],
                  8
                ],
                'fill-extrusion-base': [
                  'case',
                  ['has', 'min_height'],
                  ['get', 'min_height'],
                  0
                ],
                'fill-extrusion-opacity': 0.2,
                'fill-extrusion-translate': [4, 4],
                'fill-extrusion-translate-anchor': 'viewport',
                'fill-extrusion-vertical-gradient': true
              }
            }, '3d-buildings-base');

            // Fin de las capas de edificios
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