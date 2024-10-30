import {Router} from 'express';
import { registrarCliente } from '../controllers/clienteController.js';

const router = Router();

router.post('/registrar-cliente',registrarCliente);


export default router;