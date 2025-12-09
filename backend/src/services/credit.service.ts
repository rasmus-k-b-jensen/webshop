import { PrismaClient } from '@prisma/client';
import { AdjustCreditsDTO, CreditTransactionQuery } from '../types/dtos';
import { CreditTransactionType } from '../types';
import { NotFoundError, ValidationError } from '../utils/errors';
import { config } from '../config';

const prisma = new PrismaClient();

export class CreditService {
  /**
   * Adjust customer credits (add or subtract)
   * This wraps the credit change and transaction creation in a database transaction
   */
  async adjustCredits(data: AdjustCreditsDTO, adminUserId?: string) {
    // Validate customer exists
    const customer = await prisma.user.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Validate amount
    if (data.amount === 0) {
      throw new ValidationError('Amount cannot be zero');
    }

    // Calculate new balance
    const newBalance = customer.creditBalance + data.amount;

    // Check for negative balance
    if (!config.allowNegativeBalance && newBalance < 0) {
      throw new ValidationError('Operation would result in negative balance');
    }

    // Execute in transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create credit transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          customerId: data.customerId,
          amount: data.amount,
          type: data.type,
          reason: data.reason,
          createdByUserId: adminUserId,
        },
      });

      // Update customer balance
      const updatedCustomer = await tx.user.update({
        where: { id: data.customerId },
        data: { creditBalance: newBalance },
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

      return { transaction, customer: updatedCustomer };
    });

    return result;
  }

  /**
   * Get credit transactions with optional filters
   */
  async getCreditTransactions(query: CreditTransactionQuery) {
    const where: any = {};

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = query.startDate;
      }
      if (query.endDate) {
        where.createdAt.lte = query.endDate;
      }
    }

    const transactions = await prisma.creditTransaction.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        relatedOrder: true,
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
      skip: query.offset || 0,
    });

    return transactions;
  }

  /**
   * Get customer credit history with running balance
   */
  async getCustomerCreditHistory(customerId: string) {
    const transactions = await prisma.creditTransaction.findMany({
      where: { customerId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        relatedOrder: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate running balance for each transaction
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { creditBalance: true },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    let runningBalance = customer.creditBalance;
    const historyWithBalance = transactions.map((transaction) => {
      const balanceAfter = runningBalance;
      runningBalance -= transaction.amount; // Going backwards in time
      
      return {
        ...transaction,
        balanceAfter,
      };
    });

    return historyWithBalance.reverse(); // Return in chronological order
  }

  /**
   * Validate credit balance integrity
   * Ensures that creditBalance matches the sum of all transactions
   */
  async validateCreditBalance(customerId: string): Promise<{
    isValid: boolean;
    actualBalance: number;
    calculatedBalance: number;
  }> {
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { creditBalance: true },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const transactions = await prisma.creditTransaction.findMany({
      where: { customerId },
      select: { amount: true },
    });

    const calculatedBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      isValid: customer.creditBalance === calculatedBalance,
      actualBalance: customer.creditBalance,
      calculatedBalance,
    };
  }

  /**
   * Get credit statistics for admin dashboard
   */
  async getCreditStatistics() {
    const [totalIssued, totalSpent, customerCount] = await Promise.all([
      // Total credits issued (positive transactions)
      prisma.creditTransaction.aggregate({
        where: {
          amount: { gt: 0 },
        },
        _sum: { amount: true },
      }),
      // Total credits spent (negative transactions)
      prisma.creditTransaction.aggregate({
        where: {
          amount: { lt: 0 },
        },
        _sum: { amount: true },
      }),
      // Total customers
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),
    ]);

    return {
      totalCreditsIssued: totalIssued._sum.amount || 0,
      totalCreditsSpent: Math.abs(totalSpent._sum.amount || 0),
      totalCustomers: customerCount,
    };
  }
}
