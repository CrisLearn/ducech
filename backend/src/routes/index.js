import { Router } from 'express';
import adminRoutes from './adminRoutes.js'; 

const router = Router();


router.use('/admin', adminRoutes); 




export default router;
