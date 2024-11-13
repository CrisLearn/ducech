import express from 'express';
import { createAdmin, loginAdmin, updateAdmin, getAllTecnicos, getTecnicoById, generateTecnicosReport } from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registrar-admin', createAdmin);
router.post('/login-admin', loginAdmin);
router.put('/update-admin', authMiddleware,updateAdmin);
router.get('/tecnicos', authMiddleware,getAllTecnicos);
router.get('/tecnico/:id', authMiddleware,getTecnicoById);
router.get('/reportes-tecnicos', authMiddleware,generateTecnicosReport);

export default router;
