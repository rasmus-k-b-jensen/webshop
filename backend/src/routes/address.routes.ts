import { Router } from 'express';
import { addressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createAddressValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
  body('addressLine2').optional().trim(),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').optional().trim(),
  body('postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('isDefault').optional().isBoolean(),
];

const updateAddressValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('addressLine1').optional().trim().notEmpty().withMessage('Address line 1 cannot be empty'),
  body('addressLine2').optional().trim(),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim(),
  body('postalCode').optional().trim().notEmpty().withMessage('Postal code cannot be empty'),
  body('country').optional().trim().notEmpty().withMessage('Country cannot be empty'),
  body('isDefault').optional().isBoolean(),
];

// Routes
router.post('/', createAddressValidation, validate, addressController.createAddress);
router.get('/', addressController.getMyAddresses);
router.get('/:id', addressController.getAddressById);
router.put('/:id', updateAddressValidation, validate, addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.post('/:id/set-default', addressController.setDefaultAddress);

export default router;
