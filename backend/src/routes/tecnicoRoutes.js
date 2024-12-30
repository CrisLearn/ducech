import express from 'express';
import { createTecnico, 
    loginTecnico, 
    updateTecnico,
    getTecnicoProfile, 
    createClienteForTecnico, 
    getAllClientes, 
    getClienteById,
    updateClienteForTecnico,
    generateClientesReport,
    createVehiculoForTecnico,
    updateVehiculoForTecnico,
    getAllVehiculos,
    getVehiculoById,
    generateVehiculosReport,
    createMantenimientoForVehiculo,
    getAllMantenimientos,
    eliminarMantenimientoPorTecnico,
    desactivarMantenimientoPorTecnico,
    generateMantenimientosReport
 } from '../controllers/tecnicoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registrar-tecnico', createTecnico);
router.get('/perfil-tecnico', authMiddleware, getTecnicoProfile);
router.post('/login-tecnico', loginTecnico);
router.put('/update-tecnico', authMiddleware,updateTecnico);
router.post('/registrar-cliente', authMiddleware,createClienteForTecnico);
router.get('/clientes', authMiddleware,getAllClientes);
router.get('/cliente/:id', authMiddleware,getClienteById);
router.put('/update-cliente/:id', authMiddleware,updateClienteForTecnico);
router.put('/update-vehiculo/:id', authMiddleware,updateVehiculoForTecnico);
router.get('/reportes-clientes', authMiddleware,generateClientesReport);
router.post('/registrar-vehiculo', authMiddleware,createVehiculoForTecnico);
router.get('/vehiculos', authMiddleware,getAllVehiculos);
router.get('/vehiculo/:id', authMiddleware,getVehiculoById);
router.get('/reportes-vehiculos', authMiddleware,generateVehiculosReport);
router.post('/registrar-mantenimiento', authMiddleware,createMantenimientoForVehiculo);
router.get('/mantenimientos', authMiddleware,getAllMantenimientos);
router.delete('/delete-mantenimiento/:id', authMiddleware,eliminarMantenimientoPorTecnico);
router.put('/desactivar-mantenimiento/:id', authMiddleware,desactivarMantenimientoPorTecnico);
router.get('/reportes-mantenimientos', authMiddleware,generateMantenimientosReport);

export default router;
