import { PrismaClient } from '@prisma/client';
import { CreateProductDTO, UpdateProductDTO } from '../types/dtos';
import { NotFoundError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

export class ProductService {
  /**
   * Get all products (optionally filter by active status)
   */
  async getAllProducts(activeOnly: boolean = false) {
    const where = activeOnly ? { isActive: true } : {};

    return await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDTO) {
    // Validate price
    if (data.priceInCredits < 0) {
      throw new ValidationError('Price must be non-negative');
    }

    // Validate stock
    if (data.stock !== null && data.stock !== undefined && data.stock < 0) {
      throw new ValidationError('Stock must be non-negative or null');
    }

    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        priceInCredits: data.priceInCredits,
        stock: data.stock,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, data: UpdateProductDTO) {
    // Check if product exists
    await this.getProductById(id);

    // Validate price if provided
    if (data.priceInCredits !== undefined && data.priceInCredits < 0) {
      throw new ValidationError('Price must be non-negative');
    }

    // Validate stock if provided
    if (data.stock !== null && data.stock !== undefined && data.stock < 0) {
      throw new ValidationError('Stock must be non-negative or null');
    }

    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a product (soft delete by setting isActive to false)
   */
  async deleteProduct(id: string) {
    // Check if product exists
    await this.getProductById(id);

    return await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Toggle product active status
   */
  async toggleActive(id: string) {
    const product = await this.getProductById(id);

    return await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });
  }
}
