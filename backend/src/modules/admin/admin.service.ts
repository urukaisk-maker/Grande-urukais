import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisCacheService } from '../../infrastructure/redis/redis-cache.service';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductDto,
  UpdateProductDto,
  UpdateOrderStatusDto,
  UpdateUserRoleDto,
} from './dto/admin.dto';
import { UserRole, OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private cache: RedisCacheService,
    private messaging: MessagingService,
  ) {}

  // ─── Stats ────────────────────────────────────────────

  async getStats() {
    const [products, orders, users, reviews, totalRevenue, lowStock] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.user.count(),
      this.prisma.review.count(),
      this.prisma.order.aggregate({ _sum: { total: true } }),
      this.prisma.product.count({ where: { stock: { lte: 10 } } }),
    ]);

    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const lowStockProducts = await this.prisma.product.findMany({
      where: { stock: { lte: 10 } },
      select: { id: true, name: true, stock: true, price: true },
      orderBy: { stock: 'asc' },
      take: 5,
    });

    return {
      products,
      orders,
      users,
      reviews,
      totalRevenue: totalRevenue._sum.total || 0,
      lowStock,
      recentOrders,
      lowStockProducts,
    };
  }

  // ─── Categories CRUD ─────────────────────────────────

  async getAllCategories() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({ data: dto });
    await this.cache.invalidateCatalog();
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Categoría no encontrada');
    const category = await this.prisma.category.update({ where: { id }, data: dto });
    await this.cache.invalidateCatalog();
    return category;
  }

  async deleteCategory(id: string) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Categoría no encontrada');
    const category = await this.prisma.category.delete({ where: { id } });
    await this.cache.invalidateCatalog();
    return category;
  }

  // ─── Products CRUD ───────────────────────────────────

  async getAllProducts(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: { select: { images: true, variants: true, reviews: true } },
        },
      }),
      this.prisma.product.count(),
    ]);
    return { data, total, page, limit };
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: dto,
      include: { category: true },
    });
    await this.cache.invalidateCatalog();
    await this.messaging.publishProductCreated(product.id, product.name);
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Producto no encontrado');
    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
    await this.cache.invalidateCatalog();
    await this.messaging.publishProductUpdated(product.id, product.name);
    return product;
  }

  async deleteProduct(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Producto no encontrado');
    const product = await this.prisma.product.delete({ where: { id } });
    await this.cache.invalidateCatalog();
    return product;
  }

  // ─── Orders ──────────────────────────────────────────

  async getAllOrders(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.order.count(),
    ]);
    return { data, total, page, limit };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        payments: true,
      },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status as OrderStatus },
      include: { items: true },
    });
    await this.messaging.publishOrderStatusUpdated(id, dto.status);
    return updated;
  }

  // ─── Users ───────────────────────────────────────────

  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true, reviews: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return { data, total, page, limit };
  }

  async updateUserRole(id: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role as UserRole },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
  }

  // ─── Reviews ─────────────────────────────────────────

  async getAllReviews(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.review.count(),
    ]);
    return { data, total, page, limit };
  }

  async deleteReview(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    return this.prisma.review.delete({ where: { id } });
  }

  // ─── Product Images (S3) ──────────────────────────────

  async addProductImage(productId: string, url: string, order: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.prisma.productImage.create({
      data: { productId, url, order },
    });
  }

  async deleteProductImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image || image.productId !== productId) {
      throw new NotFoundException('Imagen no encontrada');
    }
    return this.prisma.productImage.delete({ where: { id: imageId } });
  }
}
