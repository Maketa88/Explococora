export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN,
  defaultOptions: {
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-75.4930, 4.6368],

    zoom: 13,
    language: 'es',
    attributionControl: true,
    customAttribution: '© Explococora'
  }
}; 