import express from 'express';
import { createCliente, loginCliente, updateCliente } from '../controllers/clienteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registrar-cliente', createCliente);
router.post('/login-cliente', loginCliente);
router.put('/update-cliente', authMiddleware,updateCliente);

export default router;