import express from 'express';
import { createTecnico, 
    loginTecnico, 
    updateTecnico, 
    createClienteForTecnico, 
    getAllClientes, 
    getClienteById,
    generateClientesReport,
    getAllVehiculos,
    getVehiculoById,
    generateVehiculosReport,
    createMantenimientoForVehiculo
 } from '../controllers/tecnicoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registrar-tecnico', createTecnico);
router.post('/login-tecnico', loginTecnico);
router.put('/update-tecnico', authMiddleware,updateTecnico);
router.post('/registrar-cliente', authMiddleware,createClienteForTecnico);
router.get('/clientes', authMiddleware,getAllClientes);
router.get('/cliente/:id', authMiddleware,getClienteById);
router.get('/reportes-clientes', authMiddleware,generateClientesReport);
router.get('/vehiculos', authMiddleware,getAllVehiculos);
router.get('/vehiculo/:id', authMiddleware,getVehiculoById);
router.get('/reportes-vehiculos', authMiddleware,generateVehiculosReport);
router.post('/registrar-mantenimiento', authMiddleware,createMantenimientoForVehiculo);

export default router;
