import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { ProductQueryDto } from '../../common/dto/pagination-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RedisCacheService implements OnModuleInit {
  private readonly logger = new Logger(RedisCacheService.name);
  private redis: any;
  private connected = false;
  private readonly DEFAULT_TTL = 300; // 5 minutes

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set — caching disabled');
      return;
    }

    try {
      const { createClient } = await import('redis');
      this.redis = createClient({ url: redisUrl });
      this.redis.on('error', (err: any) => {
        this.logger.error(`Redis error: ${err.message}`);
        this.connected = false;
      });
      this.redis.on('connect', () => {
        this.logger.log('Redis connected');
        this.connected = true;
      });
      await this.redis.connect();
    } catch (err: any) {
      this.logger.warn(`Redis connection failed: ${err.message} — caching disabled`);
    }
  }

  private isEnabled(): boolean {
    return this.connected && !!this.redis;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled()) return null;
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await this.redis.setEx(key, ttl || this.DEFAULT_TTL, JSON.stringify(value));
    } catch (err: any) {
      this.logger.warn(`Cache set failed: ${err.message}`);
    }
  }

  async del(pattern: string): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    } catch (err: any) {
      this.logger.warn(`Cache del failed: ${err.message}`);
    }
  }

  // === Catalog caching ===

  async getCategoriesCached() {
    const cacheKey = 'catalog:categories';
    const cached = await this.get(cacheKey);
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    await this.set(cacheKey, categories);
    return categories;
  }

  async getProductsCached(query: ProductQueryDto) {
    const { page, limit, categoryId, search, minPrice, maxPrice, sortBy, sortOrder } = query;
    const cacheKey = `catalog:products:${JSON.stringify({ page, limit, categoryId, search, minPrice, maxPrice, sortBy, sortOrder })}`;
    const cached = await this.get(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const validSortFields = ['name', 'price', 'createdAt', 'stock'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortDirection },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: { where: { isActive: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const result = { data, total, page, limit };
    await this.set(cacheKey, result);
    return result;
  }

  async invalidateCatalog(): Promise<void> {
    await this.del('catalog:categories');
    await this.del('catalog:products:*');
  }
}
