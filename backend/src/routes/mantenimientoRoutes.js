import {Router} from 'express';
import { registrarMantenimiento } from '../controllers/mantenimientoController.js';

const router = Router();

router.post('/registrar-mantenimiento',registrarMantenimiento);


export default router;