import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { createOrderValidation, validate } from '../middleware/validation.middleware';

const router = Router();
const orderController = new OrderController();

// Customer routes
router.post(
  '/',
  authenticate,
  createOrderValidation,
  validate,
  orderController.create.bind(orderController)
);

router.get(
  '/my-orders',
  authenticate,
  orderController.getMyOrders.bind(orderController)
);

// Admin routes
router.get(
  '/',
  authenticate,
  requireAdmin,
  orderController.getWithFilters.bind(orderController)
);

router.get(
  '/:id',
  authenticate,
  orderController.getById.bind(orderController)
);

router.put(
  '/:id/status',
  authenticate,
  requireAdmin,
  orderController.updateStatus.bind(orderController)
);

export default router;
