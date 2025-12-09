import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { createProductValidation, updateProductValidation, validate } from '../middleware/validation.middleware';

const router = Router();
const productController = new ProductController();

// Public/customer routes
router.get('/', productController.getAll.bind(productController));
router.get('/:id', productController.getById.bind(productController));

// Admin routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  createProductValidation,
  validate,
  productController.create.bind(productController)
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  updateProductValidation,
  validate,
  productController.update.bind(productController)
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  productController.delete.bind(productController)
);

router.patch(
  '/:id/toggle-active',
  authenticate,
  requireAdmin,
  productController.toggleActive.bind(productController)
);

export default router;
