import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { OrderService } from '../services/order.service';
import { CreateOrderDTO } from '../types/dtos';

const orderService = new OrderService();

export class OrderController {
  /**
   * Create a new order (purchase)
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const data: CreateOrderDTO = req.body;
      const order = await orderService.createOrder(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Product redeemed successfully!',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer's own orders
   */
  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const orders = await orderService.getCustomerOrders(req.user.userId);

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (admin only)
   */
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const orders = await orderService.getAllOrders(limit, offset);

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status (admin only)
   */
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, trackingNumber } = req.body;

      const order = await orderService.updateOrderStatus(id, status, trackingNumber);

      res.json({
        success: true,
        data: order,
        message: 'Order status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get orders with filters (admin only)
   */
  async getWithFilters(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await orderService.getOrdersWithFilters({
        status,
        customerId,
        limit,
        offset,
      });

      res.json({
        success: true,
        data: result.orders,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }
}
