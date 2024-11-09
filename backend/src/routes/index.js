import { Router } from 'express';
// import adminRoutes from './adminRoutes.js'; 
// import tecnicoRoutes from './tecnicoRoutes.js'; 
import clienteRoutes from './clienteRoutes.js'; 

const router = Router();


// router.use('/admin', adminRoutes); 
// router.use('/tecnico', tecnicoRoutes); 
router.use('/cliente', clienteRoutes); 




export default router;
