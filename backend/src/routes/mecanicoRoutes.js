import {Router} from 'express';
import { registrarMecanico, loginMecanico } from '../controllers/mecanicoController.js';

const router = Router();

router.post('/registrar-mecanico',registrarMecanico);
router.post('/login',loginMecanico);



export default router;