import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import { RegisterDTO, LoginDTO } from '../types/dtos';

const authService = new AuthService();

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: RegisterDTO = req.body;
      const result = await authService.register(data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data: LoginDTO = req.body;
      const result = await authService.login(data);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   */
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const user = await authService.getCurrentUser(req.user.userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
