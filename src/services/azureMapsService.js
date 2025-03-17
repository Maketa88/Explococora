import axios from 'axios';
import { AZURE_MAPS_CONFIG } from '../components/MapaRuta/config/azureMapConfig';

// URL base para las peticiones a Azure Maps
const AZURE_MAPS_BASE_URL = 'https://atlas.microsoft.com/';

// Crear una instancia de axios configurada para Azure Maps
const azureMapsApi = axios.create({
  baseURL: AZURE_MAPS_BASE_URL,
  params: {
    'subscription-key': AZURE_MAPS_CONFIG.subscriptionKey,
    'api-version': '1.0'
  }
});

/**
 * Obtiene una ruta entre dos puntos
 * @param {Array} origen - Coordenadas de origen [longitud, latitud]
 * @param {Array} destino - Coordenadas de destino [longitud, latitud]
 * @param {Array} puntosIntermedio - Array de puntos intermedios [[long1, lat1], [long2, lat2], ...]
 * @returns {Promise} Promesa con los datos de la ruta
 */
export const obtenerRuta = async (origen, destino, puntosIntermedio = []) => {
  try {
    // Validar coordenadas de origen y destino
    if (!origen || !destino || !Array.isArray(origen) || !Array.isArray(destino)) {
      console.error('Coordenadas inválidas:', { origen, destino });
      return {
        routes: [
          {
            summary: {
              lengthInMeters: 0,
              travelTimeInSeconds: 0,
              trafficDelayInSeconds: 0,
              departureTime: new Date().toISOString(),
              arrivalTime: new Date().toISOString()
            },
            legs: []
          }
        ]
      };
    }
    
    // Formatear coordenadas para la API de Azure Maps
    const origenStr = `${origen[0]},${origen[1]}`;
    const destinoStr = `${destino[0]},${destino[1]}`;
    
    // Construir cadena de puntos de ruta
    let routePoints = origenStr;
    
    // Añadir puntos intermedios si existen
    if (puntosIntermedio && puntosIntermedio.length > 0) {
      // Filtrar puntos intermedios válidos
      const puntosValidos = puntosIntermedio.filter(punto => 
        Array.isArray(punto) && punto.length >= 2 && 
        typeof punto[0] === 'number' && typeof punto[1] === 'number'
      );
      
      // Añadir los puntos válidos a la cadena
      puntosValidos.forEach(punto => {
        routePoints += `:${punto[0]},${punto[1]}`;
      });
    }
    
    // Añadir el destino
    routePoints += `:${destinoStr}`;
    
    // Construir los parámetros de la solicitud
    const params = {
      query: routePoints,
      routeType: 'fastest',
      traffic: false, // Cambiado a false para evitar posibles problemas
      travelMode: 'pedestrian', // Opciones: car, truck, pedestrian
      sectionType: 'travelMode',
      instructionsType: 'text',
      language: 'es-ES',
      computeBestOrder: false,
      computeTravelTimeFor: 'all'
    };
    
    // Realizar la petición a la API
    const response = await azureMapsApi.get('/route/directions/json', { params });
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener la ruta:', error);
    // Proporcionar un objeto de ruta vacío en caso de error para evitar fallos en la UI
    return {
      routes: [
        {
          summary: {
            lengthInMeters: 0,
            travelTimeInSeconds: 0,
            trafficDelayInSeconds: 0,
            departureTime: new Date().toISOString(),
            arrivalTime: new Date().toISOString()
          },
          legs: []
        }
      ]
    };
  }
};

/**
 * Obtiene información de un punto específico (búsqueda inversa)
 * @param {Array} coordenadas - Coordenadas del punto [longitud, latitud]
 * @returns {Promise} Promesa con los datos del punto
 */
export const obtenerInformacionPunto = async (coordenadas) => {
  try {
    const coordenadasStr = `${coordenadas[0]},${coordenadas[1]}`;
    
    const params = {
      query: coordenadasStr,
      returnSpeedLimit: false,
      returnRoadUse: false,
      returnMatchType: false,
      returnAddressDetails: true
    };
    
    const response = await azureMapsApi.get('/search/address/reverse/json', { params });
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener información del punto:', error);
    throw error;
  }
};

/**
 * Busca lugares por nombre o términos
 * @param {string} consulta - Términos de búsqueda
 * @param {Array} centro - Coordenadas del centro de búsqueda [longitud, latitud]
 * @param {number} radio - Radio de búsqueda en metros
 * @returns {Promise} Promesa con los resultados de la búsqueda
 */
export const buscarLugares = async (consulta, centro = null, radio = 10000) => {
  try {
    const params = {
      query: consulta,
      limit: 10,
      language: 'es-ES',
      countrySet: 'CO', // Código de país para Colombia
      idxSet: 'POI' // Índice de puntos de interés
    };
    
    // Si se proporciona un centro, agregar parámetros de búsqueda por área
    if (centro) {
      params.lat = centro[1];
      params.lon = centro[0];
      params.radius = radio;
    }
    
    const response = await azureMapsApi.get('/search/fuzzy/json', { params });
    
    return response.data;
  } catch (error) {
    console.error('Error al buscar lugares:', error);
    throw error;
  }
}; 