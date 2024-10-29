import { Router } from 'express';
import adminRoutes from './adminRoutes.js'; // Importar las rutas del administrador

const router = Router();

// Usa las rutas específicas con prefijos
router.use('/admin', adminRoutes); // Todas las rutas de administrador estarán bajo /api/admins

// Puedes definir más rutas o middlewares aquí

export default router;
