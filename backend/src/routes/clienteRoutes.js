import express from 'express';
import { crearCliente, loginCliente, crearVehiculo, crearMantenimiento } from '../controllers/clienteController.js';
import { authMiddleware } from "../middlewares/authJWT.js";

const router = express.Router();

router.post('/registrar-cliente', crearCliente);

router.post('/login-cliente', loginCliente);

router.post('/registrar-vehiculo',authMiddleware, crearVehiculo);

router.post('/registrar-mantenimiento',authMiddleware, crearMantenimiento);

// router.put('/update/:id', updateCliente);

// router.delete('/delete/:id', deleteCliente);

export default router;
