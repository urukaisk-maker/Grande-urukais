import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';
import { CheckoutDto } from './dto/orders.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private messaging: MessagingService,
  ) {}

  async checkout(user: AuthUser | undefined, dto: CheckoutDto) {
    // Calculate total
    const total = dto.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        userId: user?.id,
        customerEmail: dto.customerEmail,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        shippingAddress: dto.shippingAddress,
        total,
        status: 'PENDING',
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Publish order.created event
    await this.messaging.publishOrderCreated(order.id, total, dto.customerEmail);

    // Create payment record with Stripe
    const stripeSecretKey = this.config.get<string>('app.stripe.secretKey');

    let clientSecret: string | null = null;

    if (stripeSecretKey) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(stripeSecretKey);

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100), // cents
          currency: 'eur',
          metadata: {
            orderId: order.id,
            customerEmail: dto.customerEmail,
          },
        });

        await this.prisma.payment.create({
          data: {
            orderId: order.id,
            provider: 'STRIPE',
            status: 'PENDING',
            amount: total,
            currency: 'eur',
            providerPaymentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
          },
        });

        clientSecret = paymentIntent.client_secret;
      } catch (err) {
        this.logger.error(`Stripe error: ${(err as Error).message}`);
        // Fall back to mock payment
        await this.prisma.payment.create({
          data: {
            orderId: order.id,
            provider: 'MOCK',
            status: 'PENDING',
            amount: total,
            currency: 'eur',
            clientSecret: `mock_secret_${order.id}`,
          },
        });
        clientSecret = `mock_secret_${order.id}`;
      }
    } else {
      // No Stripe configured — use mock
      this.logger.warn('Stripe not configured, using mock payment');
      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'MOCK',
          status: 'PENDING',
          amount: total,
          currency: 'eur',
          clientSecret: `mock_secret_${order.id}`,
        },
      });
      clientSecret = `mock_secret_${order.id}`;
    }

    return {
      order: { id: order.id },
      clientSecret,
    };
  }

  async getOrders(user: AuthUser) {
    return this.prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(user: AuthUser, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId: user.id },
      include: { items: true, payments: true },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return order;
  }
}
