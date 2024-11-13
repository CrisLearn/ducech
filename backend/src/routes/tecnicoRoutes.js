import express from 'express';
import { createTecnico, loginTecnico, updateTecnico, /*createClienteForTecnico*/ } from '../controllers/tecnicoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registrar-tecnico', createTecnico);
router.post('/login-tecnico', loginTecnico);
router.put('/update-tecnico', authMiddleware,updateTecnico);
//router.post('/registrar-cliente', authMiddleware,createClienteForTecnico);

export default router;
