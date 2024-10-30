import {Router} from 'express';
import { registerMecanico, loginMecanico } from '../controllers/mecanicoController.js';

const router = Router();

router.post('/register',registerMecanico);

router.post('/login',loginMecanico);

export default router;