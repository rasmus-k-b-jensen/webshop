import { PrismaClient } from '@prisma/client';
import { CreateOrderDTO } from '../types/dtos';
import { CreditTransactionType, OrderStatus } from '../types';
import { NotFoundError, ValidationError, InsufficientCreditsError } from '../utils/errors';

const prisma = new PrismaClient();

export class OrderService {
  /**
   * Create a new order (purchase with credits)
   * This is a critical operation that must be atomic
   */
  async createOrder(customerId: string, data: CreateOrderDTO) {
    const quantity = data.quantity || 1;

    if (quantity < 1) {
      throw new ValidationError('Quantity must be at least 1');
    }

    // Validate shipping address
    let shippingAddress;
    if (data.shippingAddressId) {
      // Use existing address
      const address = await prisma.address.findFirst({
        where: {
          id: data.shippingAddressId,
          userId: customerId,
        },
      });

      if (!address) {
        throw new NotFoundError('Shipping address not found');
      }

      shippingAddress = {
        name: address.name,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };
    } else if (data.shippingAddress) {
      // Use provided address
      shippingAddress = data.shippingAddress;
    } else {
      throw new ValidationError('Shipping address is required');
    }

    // Validate product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (!product.isActive) {
      throw new ValidationError('This product is not available');
    }

    // Check stock if applicable
    if (product.stock !== null && product.stock < quantity) {
      throw new ValidationError('Insufficient stock available');
    }

    // Get customer
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Calculate total cost
    const totalCredits = product.priceInCredits * quantity;

    // Check if customer has enough credits
    if (customer.creditBalance < totalCredits) {
      throw new InsufficientCreditsError(
        `Not enough credits to redeem this product. Required: ${totalCredits}, Available: ${customer.creditBalance}`
      );
    }

    // Execute purchase in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order with shipping information
      const order = await tx.order.create({
        data: {
          customerId,
          totalCredits,
          status: 'PENDING',
          shippingName: shippingAddress.name,
          shippingAddressLine1: shippingAddress.addressLine1,
          shippingAddressLine2: shippingAddress.addressLine2,
          shippingCity: shippingAddress.city,
          shippingState: shippingAddress.state,
          shippingPostalCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country,
          isGift: data.isGift || false,
          giftMessage: data.giftMessage,
        },
      });

      // Create order item
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity,
          priceInCreditsAtPurchase: product.priceInCredits,
        },
      });

      // Create credit transaction (negative amount for purchase)
      await tx.creditTransaction.create({
        data: {
          customerId,
          amount: -totalCredits,
          type: CreditTransactionType.PURCHASE,
          reason: `Purchase: ${quantity}x ${product.name}`,
          relatedOrderId: order.id,
        },
      });

      // Update customer credit balance
      await tx.user.update({
        where: { id: customerId },
        data: {
          creditBalance: customer.creditBalance - totalCredits,
        },
      });

      // Update product stock if applicable
      if (product.stock !== null) {
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - quantity,
          },
        });
      }

      // Return full order with items
      return await tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    return result;
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(customerId: string) {
    return await prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(limit: number = 50, offset: number = 0) {
    return await prisma.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  /**
   * Get order statistics for admin dashboard
   */
  async getOrderStatistics() {
    const [totalOrders, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    return {
      totalOrders,
      recentOrders,
    };
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    trackingNumber?: string
  ) {
    const order = await this.getOrderById(orderId);

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (status === 'SHIPPED' && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }

    if (status === 'DELIVERED' && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Get orders with filters
   */
  async getOrdersWithFilters(filters: {
    status?: string;
    customerId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, customerId, limit = 50, offset = 0 } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }
}
