import express from 'express';
import { crearTecnico, loginTecnico,crearCliente } from '../controllers/tecnicoController.js';

const router = express.Router();

router.post('/registrar-tecnico', crearTecnico);

router.post('/login-tecnico', loginTecnico);

router.post('/registrar-cliente', crearCliente);

// router.put('/update/:id', updateTecnico);

// router.delete('/delete/:id', deleteTecnico);

// router.post('/create-cliente', createCliente);

export default router;
