import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

export interface CreateAddressData {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export const addressService = {
  async createAddress(userId: string, data: CreateAddressData) {
    // If this is set as default, unset any existing default
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        ...data,
      },
    });

    return address;
  },

  async getUserAddresses(userId: string) {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return addresses;
  },

  async getAddressById(addressId: string, userId: string) {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    return address;
  },

  async updateAddress(addressId: string, userId: string, data: UpdateAddressData) {
    // Verify address belongs to user
    const address = await this.getAddressById(addressId, userId);

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data,
    });

    return updated;
  },

  async deleteAddress(addressId: string, userId: string) {
    // Verify address belongs to user
    await this.getAddressById(addressId, userId);

    await prisma.address.delete({
      where: { id: addressId },
    });

    return { success: true };
  },

  async setDefaultAddress(addressId: string, userId: string) {
    // Verify address belongs to user
    await this.getAddressById(addressId, userId);

    // Unset all defaults for this user
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set the specified address as default
    const updated = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return updated;
  },
};
