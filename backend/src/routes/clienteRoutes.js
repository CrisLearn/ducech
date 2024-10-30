import {Router} from 'express';
import { registrarCliente, loginCliente } from '../controllers/clienteController.js';

const router = Router();

router.post('/registrar-cliente',registrarCliente);
router.post('/login',loginCliente);


export default router;