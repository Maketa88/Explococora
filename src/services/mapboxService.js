import axios from 'axios';
import { MAPBOX_CONFIG } from '../components/MapaRuta/config/mapboxConfig';

const BASE_URL = 'https://api.mapbox.com';

export const getMapboxClient = () => {
  return axios.create({
    baseURL: BASE_URL,
    params: {
      access_token: MAPBOX_CONFIG.accessToken
    }
  });
};

export const getRouteDirections = async (origin, destination) => {
  try {
    const client = getMapboxClient();
    const response = await client.get('/directions/v5/mapbox/driving', {
      params: {
        coordinates: `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
        alternatives: true,
        geometries: 'geojson',
        language: 'es',
        overview: 'full',
        steps: true
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al obtener la ruta:', error);
    return {
      success: false,
      error: error.message || 'Error al obtener la ruta'
    };
  }
};

export const geocodeAddress = async (address) => {
  try {
    const client = getMapboxClient();
    const response = await client.get(`/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
      params: {
        country: 'CO',
        language: 'es',
        limit: 1
      }
    });

    if (response.data.features && response.data.features.length > 0) {
      const [lng, lat] = response.data.features[0].center;
      return {
        success: true,
        data: {
          lat,
          lng,
          address: response.data.features[0].place_name
        }
      };
    }

    return {
      success: false,
      error: 'No se encontró la dirección'
    };
  } catch (error) {
    console.error('Error en geocodificación:', error);
    return {
      success: false,
      error: error.message || 'Error al geocodificar la dirección'
    };
  }
}; 