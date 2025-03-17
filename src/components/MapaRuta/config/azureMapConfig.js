// Configuración para Azure Maps
// Obtener tu clave de suscripción en https://azure.microsoft.com/es-es/services/azure-maps/
// 
// IMPORTANTE: Para usar Azure Maps, necesitas:
// 1. Crear una cuenta de Azure (puedes usar la cuenta gratuita de estudiante)
// 2. Crear un recurso de Azure Maps en el portal de Azure
// 3. Obtener la clave de suscripción desde la sección "Autenticación" del recurso
// 4. Reemplazar 'YOUR_AZURE_MAPS_KEY' con tu clave en este archivo

// Definir la clave una sola vez para evitar inconsistencias
const AZURE_MAPS_KEY = '4s8ztrQPOZ31reLiCWyRYpbQkD4lKlRlKJic348l5gXuUh3UPlZ8JQQJ99BCACYeBjFs5mg0AAAgAZMP2azq';

export const AZURE_MAPS_CONFIG = {
  // La clave de suscripción a Azure Maps
  subscriptionKey: AZURE_MAPS_KEY,
  
  // Opciones por defecto para el mapa
  defaultOptions: {
    center: [-75.25, 4.57], // Centro por defecto en Colombia
    zoom: 7,
    language: 'es-ES',
    authOptions: {
      authType: 'subscriptionKey',
      subscriptionKey: AZURE_MAPS_KEY
    },
    style: 'road' // Opciones: road, grayscale_light, dark, satellite, satellite_road_labels
  }
};

// Opciones para personalizar los marcadores
export const MARKER_OPTIONS = {
  color: '#007bff', // Color principal para marcadores
  secondaryColor: '#FF5722', // Color para marcadores secundarios
  size: 'standard' // Opciones: small, standard, large
};

// Opciones para líneas de ruta
export const LINE_OPTIONS = {
  strokeWidth: 5,
  strokeColor: '#1a73e8',
  lineJoin: 'round',
  lineCap: 'round',
  strokeOpacity: 0.8
}; 