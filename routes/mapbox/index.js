import { Router } from 'express';
import { MapboxController } from '../../controllers/MapaAzure/MapaAzureController';

const router = Router();
const mapboxController = new MapboxController();

router.post('/directions', (req, res) => mapboxController.getRouteDirections(req, res));
router.post('/geocode', (req, res) => mapboxController.geocodeAddress(req, res));

export default router; 