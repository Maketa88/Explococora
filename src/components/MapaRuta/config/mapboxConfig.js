
export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN,
  defaultOptions: {
    style: 'mapbox://styles/mapbox/satellite-streets-v12', // Cambiado a estilo satelital con calles
    center: [-75.4893, 4.6386], // Centro optimizado del Valle del Cocora
    zoom: 13,
    pitch: 60, // Inclinación para vista 3D
    bearing: 30, // Rotación para mejor perspectiva
    language: 'es',
    attributionControl: true,
    customAttribution: '© Explococora - Valle del Cocora 3D',
    terrain: {
      source: 'mapbox-dem',
      exaggeration: 1.5
    },
    projection: {
      name: 'mercator' // Proyección estándar que funciona bien con terreno 3D
    },
    antialias: true, // Mejora la calidad visual
    maxPitch: 85, // Permite una mayor inclinación para vistas más inmersivas
    minZoom: 8, // Limita el zoom mínimo para mantener el contexto
    maxZoom: 18, // Permite acercarse bastante para ver detalles
    maxBounds: [ // Establecer límites de navegación alrededor del Valle del Cocora
      [-75.6, 4.5], // Suroeste
      [-75.3, 4.8]  // Noreste
    ],
    cooperativeGestures: true, // Mejora la experiencia en dispositivos táctiles
    fadeDuration: 300, // Transiciones más suaves
    renderWorldCopies: false // Evita renderizar múltiples copias del mundo
  },
  // Configuraciones adicionales para características 3D
  terrainConfig: {
    'source': 'mapbox-dem',
    'exaggeration': 1.5
  },
  lightConfig: {
    'color': '#ffffff',
    'intensity': 0.4,
    'position': [1.15, 210, 30],
    'anchor': 'viewport'
  },
  // Rutas predefinidas para senderos populares
  trails: {
    palmasDeCera: [
      [-75.4893, 4.6386],
      [-75.4950, 4.6415],
      [-75.4980, 4.6450],
      [-75.5010, 4.6475],
      [-75.5050, 4.6500]
    ],
    miradorCocora: [
      [-75.4893, 4.6386],
      [-75.4860, 4.6400],
      [-75.4830, 4.6420],
      [-75.4800, 4.6440]
    ]
  },
  // Puntos de interés destacados
  pointsOfInterest: [
    { name: 'Mirador Principal', coordinates: [-75.4893, 4.6386] },
    { name: 'Palmas de Cera', coordinates: [-75.5010, 4.6475] },
    { name: 'Cascada', coordinates: [-75.4800, 4.6440] }
  ],
  // Configuraciones de estilo para rutas y senderos
  routeStyle: {
    main: {
      color: '#FF5733',
      width: 6,
      opacity: 0.9,
      blur: 1,
      dasharray: [0.5, 0.5]
    },
    glow: {
      color: '#FFC300',
      width: 12,
      opacity: 0.3,
      blur: 3
    }
  },
  trailStyle: {
    color: '#32CD32',
    width: 5,
    opacity: 0.8,
    blur: 0.5
  }
};