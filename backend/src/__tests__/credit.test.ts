import { PrismaClient } from '@prisma/client';
import { CreditService } from '../services/credit.service';
import { OrderService } from '../services/order.service';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const creditService = new CreditService();
const orderService = new OrderService();

describe('Credit System Tests', () => {
  let testCustomer: any;
  let testAdmin: any;
  let testProduct: any;

  beforeAll(async () => {
    // Clean up test data
    await prisma.creditTransaction.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Create test admin
    testAdmin = await prisma.user.create({
      data: {
        email: 'test-admin@test.com',
        name: 'Test Admin',
        passwordHash: await bcrypt.hash('password', 10),
        role: 'ADMIN',
        creditBalance: 0,
      },
    });

    // Create test customer
    testCustomer = await prisma.user.create({
      data: {
        email: 'test-customer@test.com',
        name: 'Test Customer',
        passwordHash: await bcrypt.hash('password', 10),
        role: 'CUSTOMER',
        creditBalance: 0,
      },
    });

    // Create test product
    testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        description: 'A test product',
        priceInCredits: 100,
        stock: 10,
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.creditTransaction.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Credit Adjustments', () => {
    test('should add credits to customer', async () => {
      const result = await creditService.adjustCredits(
        {
          customerId: testCustomer.id,
          amount: 500,
          type: 'REWARD',
          reason: 'Test credit grant',
        },
        testAdmin.id
      );

      expect(result.customer.creditBalance).toBe(500);
      expect(result.transaction.amount).toBe(500);
      expect(result.transaction.type).toBe('REWARD');
    });

    test('should subtract credits from customer', async () => {
      const result = await creditService.adjustCredits(
        {
          customerId: testCustomer.id,
          amount: -100,
          type: 'ADJUSTMENT',
          reason: 'Test deduction',
        },
        testAdmin.id
      );

      expect(result.customer.creditBalance).toBe(400);
      expect(result.transaction.amount).toBe(-100);
    });

    test('should not allow negative balance', async () => {
      await expect(
        creditService.adjustCredits(
          {
            customerId: testCustomer.id,
            amount: -500,
            type: 'ADJUSTMENT',
            reason: 'Should fail',
          },
          testAdmin.id
        )
      ).rejects.toThrow('negative balance');
    });
  });

  describe('Credit Balance Integrity', () => {
    test('balance should match sum of transactions', async () => {
      const validation = await creditService.validateCreditBalance(testCustomer.id);

      expect(validation.isValid).toBe(true);
      expect(validation.actualBalance).toBe(validation.calculatedBalance);
    });
  });

  describe('Purchase Flow', () => {
    test('should create order and deduct credits', async () => {
      const initialBalance = 400;

      const order = await orderService.createOrder(testCustomer.id, {
        productId: testProduct.id,
        quantity: 1,
      });

      expect(order).toBeDefined();
      expect(order?.totalCredits).toBe(100);
      expect(order?.items).toHaveLength(1);

      // Check customer balance updated
      const customer = await prisma.user.findUnique({
        where: { id: testCustomer.id },
      });
      expect(customer?.creditBalance).toBe(initialBalance - 100);

      // Check credit transaction created
      const transactions = await prisma.creditTransaction.findMany({
        where: {
          customerId: testCustomer.id,
          type: 'PURCHASE',
        },
      });
      expect(transactions.length).toBeGreaterThan(0);
    });

    test('should fail when insufficient credits', async () => {
      await expect(
        orderService.createOrder(testCustomer.id, {
          productId: testProduct.id,
          quantity: 10, // Costs 1000 credits, customer only has 300
        })
      ).rejects.toThrow('Not enough credits');
    });

    test('should fail when product out of stock', async () => {
      // Update product to have 0 stock
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { stock: 0 },
      });

      await expect(
        orderService.createOrder(testCustomer.id, {
          productId: testProduct.id,
          quantity: 1,
        })
      ).rejects.toThrow('Insufficient stock');

      // Restore stock
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { stock: 10 },
      });
    });

    test('should fail when product is inactive', async () => {
      // Deactivate product
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { isActive: false },
      });

      await expect(
        orderService.createOrder(testCustomer.id, {
          productId: testProduct.id,
          quantity: 1,
        })
      ).rejects.toThrow('not available');

      // Reactivate product
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { isActive: true },
      });
    });
  });

  describe('Credit History', () => {
    test('should return credit history with running balance', async () => {
      const history = await creditService.getCustomerCreditHistory(testCustomer.id);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);

      // Check that balanceAfter is calculated for each transaction
      history.forEach((txn) => {
        expect(txn.balanceAfter).toBeDefined();
      });
    });
  });
});
