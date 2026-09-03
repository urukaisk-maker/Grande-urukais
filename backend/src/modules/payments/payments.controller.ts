import { Controller, Post, Req, RawBodyRequest, Headers, BadRequestException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  @Public()
  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Webhook de Stripe para procesar pagos' })
  async stripeWebhook(@Req() req: RawBodyRequest<Request>) {
    const stripeSecretKey = this.config.get<string>('app.stripe.secretKey');
    const webhookSecret = this.config.get<string>('app.stripe.webhookSecret');

    if (!stripeSecretKey || !webhookSecret) {
      throw new BadRequestException('Stripe no configurado');
    }

    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
      throw new BadRequestException('Falta la firma de Stripe');
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey);

    let event;

    try {
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new BadRequestException('Cuerpo raw no disponible');
      }
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${(err as Error).message}`);
      throw new BadRequestException('Firma del webhook inválida');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        const payment = await this.prisma.payment.findFirst({
          where: { providerPaymentId: paymentIntent.id },
        });

        if (payment) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED' },
          });

          await this.prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'PAID' },
          });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        const payment = await this.prisma.payment.findFirst({
          where: { providerPaymentId: paymentIntent.id },
        });

        if (payment) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          });
        }
        break;
      }
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
