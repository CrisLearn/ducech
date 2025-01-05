import express from 'express';
import { createCliente, 
    loginCliente, 
    getClienteProfile,
    updateCliente,
    createVehiculoForCliente,
    getAllVehiculos,
    getVehiculoById,
    generateVehiculosReport,
    createMantenimientoForVehiculo ,
    getAllMantenimientosForCliente,
    updateVehiculoForCliente,
    eliminarMantenimiento,
    notificacionesMantenimiento,
    desactivarMantenimiento
} from '../controllers/clienteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registrar-cliente', createCliente);
router.post('/login-cliente', loginCliente);
router.get('/perfil-cliente', authMiddleware, getClienteProfile);
router.put('/update-cliente', authMiddleware,updateCliente);
router.post('/registrar-vehiculo', authMiddleware,createVehiculoForCliente);
router.put('/actualizar-vehiculo/:id', authMiddleware,updateVehiculoForCliente);
router.get('/vehiculos', authMiddleware,getAllVehiculos);
router.get('/vehiculo/:placa', authMiddleware,getVehiculoById);
router.get('/reporte-vehiculo', authMiddleware,generateVehiculosReport);
router.post('/registrar-mantenimiento', authMiddleware,createMantenimientoForVehiculo);
router.get('/mantenimientos', authMiddleware,getAllMantenimientosForCliente);
router.delete('/delete-mantenimiento/:id', authMiddleware,eliminarMantenimiento);
router.post('/notificaciones-mantenimiento', authMiddleware,notificacionesMantenimiento);
router.put('/desactivar-mantenimiento/:id', authMiddleware,desactivarMantenimiento);

export default router;