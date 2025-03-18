// Configuración para Azure Maps
// Obtener tu clave de suscripción en https://azure.microsoft.com/es-es/services/azure-maps/
// 
// IMPORTANTE: Para usar Azure Maps, necesitas:
// 1. Crear una cuenta de Azure (puedes usar la cuenta gratuita de estudiante)
// 2. Crear un recurso de Azure Maps en el portal de Azure
// 3. Obtener la clave de suscripción desde la sección "Autenticación" del recurso
// 4. La clave ahora se obtiene desde el backend para mayor seguridad

import axios from 'axios';

// URL base para el backend
const API_URL = "http://localhost:10101";

// Variable para almacenar la clave API (cache)
let AZURE_MAPS_KEY = null;

// Función asíncrona para obtener la clave API desde el backend
export const getAzureMapsKey = async () => {
  // Si ya tenemos la clave en caché, la devolvemos
  if (AZURE_MAPS_KEY) return AZURE_MAPS_KEY;
  
  try {
    console.log('Solicitando clave API de Azure Maps al backend...');
    const response = await axios.get(`${API_URL}/api/azure-maps/token`);
    
    if (response.data && response.data.success && response.data.token) {
      AZURE_MAPS_KEY = response.data.token;
      console.log('Clave API recibida correctamente');
      return AZURE_MAPS_KEY;
    } else {
      console.error('Respuesta inválida del backend:', response.data);
      return '';
    }
  } catch (error) {
    console.error('Error al obtener clave API de Azure Maps:', error);
    return '';
  }
};

export const AZURE_MAPS_CONFIG = {
  // Opciones por defecto para el mapa
  defaultOptions: {
    center: [-75.25, 4.57], // Centro por defecto en Colombia
    zoom: 7,
    language: 'es-ES',
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