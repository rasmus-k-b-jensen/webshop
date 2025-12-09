import { Router } from 'express';
import { OrderService } from '../services/order.service';
import { CreditService } from '../services/credit.service';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const orderService = new OrderService();
const creditService = new CreditService();

// Admin-only dashboard endpoint
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [orderStats, creditStats] = await Promise.all([
      orderService.getOrderStatistics(),
      creditService.getCreditStatistics(),
    ]);

    res.json({
      success: true,
      data: {
        ...orderStats,
        ...creditStats,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
