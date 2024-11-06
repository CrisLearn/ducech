import express from 'express';
import { createTecnico, loginTecnico, updateTecnico, deleteTecnico } from '../controllers/tecnicoController.js';

const router = express.Router();

router.post('/register', createTecnico);

router.post('/login', loginTecnico);

router.put('/update/:id', updateTecnico);

router.delete('/delete/:id', deleteTecnico);

export default router;
