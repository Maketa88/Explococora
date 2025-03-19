export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhwbG9jb2NvcmEiLCJhIjoiY2x2ZHB5bm53MDAzcjJrcjQxb3k3M3JneiJ9.0KgGD5mDo5d5-c4-3pLFVw',
  defaultOptions: {
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-74.5, 40], // Coordenadas por defecto
    zoom: 9,
    language: 'es',
    attributionControl: true,
    customAttribution: '© Explococora'
  }
}; 