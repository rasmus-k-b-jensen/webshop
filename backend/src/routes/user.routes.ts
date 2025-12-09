import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// All routes are admin-only
router.use(authenticate, requireAdmin);

router.get('/customers', userController.getAllCustomers.bind(userController));
router.get('/customers/:id', userController.getCustomerById.bind(userController));
router.get('/customers/:id/profile', userController.getCustomerProfile.bind(userController));

export default router;
