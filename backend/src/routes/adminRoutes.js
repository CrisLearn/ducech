import express from 'express';
import { createAdmin, loginAdmin, updateAdmin, deleteAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.post('/register', createAdmin);

router.post('/login', loginAdmin);

router.put('/:id', updateAdmin);

router.delete('/:id', deleteAdmin);

export default router;
