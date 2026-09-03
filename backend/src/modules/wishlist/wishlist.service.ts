import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(user: AuthUser) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
            images: { orderBy: { order: 'asc' } },
            variants: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => item.product);
  }

  async addToWishlist(user: AuthUser, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Upsert — if already exists, do nothing (idempotent)
    await this.prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      create: {
        userId: user.id,
        productId,
      },
      update: {},
    });

    return { success: true };
  }

  async removeFromWishlist(user: AuthUser, productId: string) {
    await this.prisma.wishlistItem.deleteMany({
      where: { userId: user.id, productId },
    });
  }

  async isFavorite(user: AuthUser, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    return item !== null;
  }
}
