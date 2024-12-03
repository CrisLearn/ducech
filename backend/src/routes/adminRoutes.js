import express from 'express';
import { createAdmin, 
    loginAdmin,
    getAdminProfile, 
    updateAdmin, 
    getAllTecnicos, 
    getTecnicoById, 
    generateTecnicosReport,
    getAllClientes,
    getClienteById,
    generateClientesReport,
    getAllVehiculos,
    getVehiculoById,
    getAllMantenimientos,
    generateVehiculosReport,
    generateMantenimientosReport 
} from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registrar-admin', createAdmin);
router.post('/login-admin', loginAdmin);
router.get('/perfil-admin', getAdminProfile);
router.put('/update-admin', authMiddleware,updateAdmin);
router.get('/tecnicos', authMiddleware,getAllTecnicos);
router.get('/tecnico/:id', authMiddleware,getTecnicoById);
router.get('/reportes-tecnicos', authMiddleware,generateTecnicosReport);
router.get('/clientes', authMiddleware,getAllClientes);
router.get('/cliente/:id', authMiddleware,getClienteById);
router.get('/reportes-clientes', authMiddleware,generateClientesReport);
router.get('/vehiculos', authMiddleware,getAllVehiculos);
router.get('/vehiculo/:id', authMiddleware,getVehiculoById);
router.get('/mantenimientos', authMiddleware,getAllMantenimientos);
router.get('/reportes-vehiculos', authMiddleware,generateVehiculosReport);
router.get('/reportes-mantenimientos', authMiddleware,generateMantenimientosReport);

export default router;
