import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('Error:', err);
  }

  // Handle operational errors
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Handle unexpected errors
  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    error: config.nodeEnv === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
  });
};
