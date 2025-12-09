import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

/**
 * Middleware to check validation results
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    throw new ValidationError(errorMessages);
  }
  next();
};

// Auth validation rules
export const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Product validation rules
export const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priceInCredits')
    .isInt({ min: 0 })
    .withMessage('Price must be a non-negative integer'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer or null'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid'),
];

export const updateProductValidation = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('priceInCredits')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Price must be a non-negative integer'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer or null'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid'),
];

// Order validation rules
export const createOrderValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

// Credit validation rules
export const adjustCreditsValidation = [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('amount').isInt().withMessage('Amount must be an integer'),
  body('type')
    .isIn(['REWARD', 'ADJUSTMENT'])
    .withMessage('Type must be REWARD or ADJUSTMENT'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
];
