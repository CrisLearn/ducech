import express from 'express';
import { createCliente, 
    loginCliente, 
    updateCliente,
    createVehiculoForCliente,
    getAllVehiculos,
    getVehiculoById,
    generateVehiculosReport,
    createMantenimientoForVehiculo 
} from '../controllers/clienteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registrar-cliente', createCliente);
router.post('/login-cliente', loginCliente);
router.put('/update-cliente', authMiddleware,updateCliente);
router.post('/registrar-vehiculo', authMiddleware,createVehiculoForCliente);
router.get('/vehiculos', authMiddleware,getAllVehiculos);
router.get('/vehiculo/:id', authMiddleware,getVehiculoById);
router.get('/reporte-vehiculo', authMiddleware,generateVehiculosReport);
router.post('/registrar-mantenimiento', authMiddleware,createMantenimientoForVehiculo);

export default router;