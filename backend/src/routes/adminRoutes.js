import { Router } from 'express';
import { registerAdmin, loginAdmin } from '../controllers/adminController.js';

const router = Router();

// Ruta para registrar un nuevo administrador
router.post('/register', registerAdmin);

// Ruta para iniciar sesión
router.post('/login', loginAdmin);

export default router;
