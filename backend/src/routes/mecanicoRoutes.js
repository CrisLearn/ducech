import {Router} from 'express';
import { registrarMecanico } from '../controllers/mecanicoController.js';

const router = Router();

router.post('/registrar-mecanico',registrarMecanico);



export default router;