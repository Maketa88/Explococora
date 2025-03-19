import { Request, Response } from 'express';
import { RouteRequest } from '../../Dto/Interface/Mapa';
import { MapboxService } from '../../services/Mapa/MapaBox';

export class MapboxController {
  private mapboxService: MapboxService;

  constructor() {
    this.mapboxService = new MapboxService();
  }

  async getRouteDirections(req: Request, res: Response): Promise<void> {
    try {
      const { origin, destination } = req.body as RouteRequest;

      if (!origin || !destination) {
        res.status(400).json({
          success: false,
          error: 'Se requieren coordenadas de origen y destino'
        });
        return;
      }

      const result = await this.mapboxService.getRouteDirections(origin, destination);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error en el controlador de mapbox:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async geocodeAddress(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.body;

      if (!address) {
        res.status(400).json({
          success: false,
          error: 'Se requiere una dirección para geocodificar'
        });
        return;
      }

      const result = await this.mapboxService.geocodeAddress(address);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error en la geocodificación:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
} 