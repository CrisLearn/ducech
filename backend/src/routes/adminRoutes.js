import { Router } from 'express';
import {
    registerAdmin,
    loginAdmin,
    obtenerPerfil,
    actualizarPerfil,
    obtenerMecanicos,
    obtenerClientes
} from '../controllers/adminController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Ruta para registrar un nuevo administrador
router.post('/register', registerAdmin);

// Ruta para iniciar sesión
router.post('/login', loginAdmin);

// Ruta para obtener el perfil del administrador
router.get('/obtener-perfil', authMiddleware, obtenerPerfil); 

// Ruta para actualizar el perfil del administrador
router.put('/actualizar-perfil', authMiddleware, actualizarPerfil); 

// Rutas para obtener mecánicos y clientes
router.get('/mecanicos', authMiddleware, obtenerMecanicos); // Cambiado a GET
router.get('/clientes', authMiddleware, obtenerClientes);   // Cambiado a GET

export default router;
