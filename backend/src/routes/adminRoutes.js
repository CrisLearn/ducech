import { Router } from 'express';
import { registerAdmin, loginAdmin, obtenerPerfil, actualizarPerfil } from '../controllers/adminController.js';

const router = Router();

// Ruta para registrar un nuevo administrador
router.post('/register', registerAdmin);

// Ruta para iniciar sesión
router.post('/login', loginAdmin);

// Ruta para obtener el perfil del administrador por ID (usando GET)
router.get('/obtener-perfil/:id', obtenerPerfil); // Usando :id para obtener el perfil por ID

// Ruta para actualizar el perfil del administrador por ID (usando PUT)
router.put('/actualizar-perfil/:id', actualizarPerfil); // Usando :id para actualizar el perfil por ID

export default router;
