import { Router } from 'express';
import { CreditController } from '../controllers/credit.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { adjustCreditsValidation, validate } from '../middleware/validation.middleware';

const router = Router();
const creditController = new CreditController();

// Customer routes
router.get(
  '/my-history',
  authenticate,
  creditController.getMyHistory.bind(creditController)
);

// Admin routes
router.post(
  '/adjust',
  authenticate,
  requireAdmin,
  adjustCreditsValidation,
  validate,
  creditController.adjustCredits.bind(creditController)
);

router.get(
  '/transactions',
  authenticate,
  requireAdmin,
  creditController.getTransactions.bind(creditController)
);

router.get(
  '/customer/:customerId/history',
  authenticate,
  requireAdmin,
  creditController.getCustomerHistory.bind(creditController)
);

router.get(
  '/statistics',
  authenticate,
  requireAdmin,
  creditController.getStatistics.bind(creditController)
);

export default router;
