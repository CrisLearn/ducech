import express from 'express';
import { createCliente, loginCliente, updateCliente, deleteCliente } from '../controllers/clienteController.js';

const router = express.Router();

router.post('/register', createCliente);

router.post('/login', loginCliente);

router.put('/update/:id', updateCliente);

router.delete('/delete/:id', deleteCliente);

export default router;
