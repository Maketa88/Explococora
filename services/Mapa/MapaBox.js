import axios from 'axios';
import { environment } from '../../config/mapa';
import { Coordinates, RouteResponse } from '../../Dto/Interface/Mapa';

export class MapboxService {
  private readonly baseUrl = environment.mapbox.baseUrl;
  private readonly accessToken = environment.mapbox.accessToken;

  async getRouteDirections(
    origin: Coordinates, 
    destination: Coordinates
  ): Promise<RouteResponse> {
    try {
      const url = `${this.baseUrl}/directions/v5/mapbox/driving/` +
        `${origin.longitude},${origin.latitude};` +
        `${destination.longitude},${destination.latitude}`;

      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          geometries: 'geojson',
          overview: 'full',
          steps: true
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error obteniendo direcciones:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async geocodeAddress(address: string): Promise<RouteResponse> {
    try {
      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
      
      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          country: 'CO',
          language: 'es',
          limit: 1
        }
      });

      if (response.data.features && response.data.features.length > 0) {
        const [longitude, latitude] = response.data.features[0].center;
        return {
          success: true,
          data: {
            latitude,
            longitude,
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
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
} 