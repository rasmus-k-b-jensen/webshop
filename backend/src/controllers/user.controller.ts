import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  /**
   * Get all customers (admin only)
   */
  async getAllCustomers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customers = await userService.getAllCustomers();

      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer by ID (admin only)
   */
  async getCustomerById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await userService.getCustomerById(id);

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer profile with details (admin only)
   */
  async getCustomerProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await userService.getCustomerProfile(id);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}
