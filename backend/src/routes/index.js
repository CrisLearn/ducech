import { Router } from 'express';
import adminRoutes from './adminRoutes.js'; // Importar las rutas del administrador
import mecanicoRoutes from './mecanicoRoutes.js'; // Importar las rutas del administrador
import mantenimientoRoutes from './mantenimientoRoutes.js'; // Importar las rutas del administrador
import vehiculoRoutes from './vehiculoRoutes.js'; // Importar las rutas del administrador
import clienteRoutes from './clienteRoutes.js'; // Importar las rutas del administrador

const router = Router();

// Usa las rutas específicas con prefijos
router.use('/admin', adminRoutes); // Todas las rutas de administrador estarán bajo /api/admins
router.use('/mecanico', mecanicoRoutes); // Todas las rutas de administrador estarán bajo /api/admins
router.use('/cliente', clienteRoutes); // Todas las rutas de administrador estarán bajo /api/admins
router.use('/vehiculo', vehiculoRoutes); // Todas las rutas de administrador estarán bajo /api/admins
router.use('/mantenimiento', mantenimientoRoutes); // Todas las rutas de administrador estarán bajo /api/admins



export default router;
