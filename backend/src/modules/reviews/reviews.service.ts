import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateReviewDto } from './dto/reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getReviews(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createReview(user: AuthUser, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Check if user already reviewed this product
    const existing = await this.prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: dto.productId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Ya has reseñado este producto');
    }

    return this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId: user.id,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }
}
