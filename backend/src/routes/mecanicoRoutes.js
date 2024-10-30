import {Router} from 'express';
import { registrarMecanico, loginMecanico,obtenerPerfil } from '../controllers/mecanicoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
const router = Router();

router.post('/registrar-mecanico',registrarMecanico);
router.post('/login',loginMecanico);
router.get('/obtener-perfil', authMiddleware, obtenerPerfil); 


export default router;