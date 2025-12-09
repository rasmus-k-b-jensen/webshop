import { PrismaClient } from '@prisma/client';
import { Role } from '../types';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Get all customers (admin only)
   */
  async getAllCustomers() {
    return await prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        creditBalance: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get customer by ID with full details
   */
  async getCustomerById(id: string) {
    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        creditBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  /**
   * Get customer with latest transactions and orders
   */
  async getCustomerProfile(id: string) {
    const customer = await this.getCustomerById(id);

    const [latestTransactions, latestOrders] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: { customerId: id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          relatedOrder: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.order.findMany({
        where: { customerId: id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      ...customer,
      latestTransactions,
      latestOrders,
    };
  }
}
