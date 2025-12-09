import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { Role } from '../types';

const authService = new AuthService();

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = authService.verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== Role.ADMIN) {
    return next(new ForbiddenError('Admin access required'));
  }

  next();
};

/**
 * Middleware to require customer role
 */
export const requireCustomer = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== Role.CUSTOMER) {
    return next(new ForbiddenError('Customer access required'));
  }

  next();
};
