import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ProductService } from '../services/product.service';
import { CreateProductDTO, UpdateProductDTO } from '../types/dtos';

const productService = new ProductService();

export class ProductController {
  /**
   * Get all products
   */
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const products = await productService.getAllProducts(activeOnly);

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new product (admin only)
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: CreateProductDTO = req.body;
      const product = await productService.createProduct(data);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a product (admin only)
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateProductDTO = req.body;
      const product = await productService.updateProduct(id, data);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a product (admin only)
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);

      res.json({
        success: true,
        message: 'Product deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle product active status (admin only)
   */
  async toggleActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.toggleActive(id);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
}
