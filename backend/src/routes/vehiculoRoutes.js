import {Router} from 'express';
import { registrarVehiculo } from '../controllers/vehiculoController.js';

const router = Router();

router.post('/registrar-vehiculo',registrarVehiculo);


export default router;