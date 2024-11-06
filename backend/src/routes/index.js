import { Router } from 'express';
import adminRoutes from './adminRoutes.js'; 
import tecnicoRoutes from './tecnicoRoutes.js'; 

const router = Router();


router.use('/admin', adminRoutes); 
router.use('/tecnico', tecnicoRoutes); 




export default router;
