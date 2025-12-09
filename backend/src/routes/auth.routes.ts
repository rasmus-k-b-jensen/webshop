import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { registerValidation, loginValidation, validate } from '../middleware/validation.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', registerValidation, validate, authController.register.bind(authController));
router.post('/login', loginValidation, validate, authController.login.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
