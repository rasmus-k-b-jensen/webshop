import { Request, Response, NextFunction } from 'express';
import { addressService, CreateAddressData, UpdateAddressData } from '../services/address.service';

export const addressController = {
  async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const addressData: CreateAddressData = req.body;

      const address = await addressService.createAddress(userId, addressData);

      res.status(201).json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const addresses = await addressService.getUserAddresses(userId);

      res.json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAddressById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const address = await addressService.getAddressById(id, userId);

      res.json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const updateData: UpdateAddressData = req.body;

      const address = await addressService.updateAddress(id, userId, updateData);

      res.json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await addressService.deleteAddress(id, userId);

      res.json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async setDefaultAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const address = await addressService.setDefaultAddress(id, userId);

      res.json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  },
};
