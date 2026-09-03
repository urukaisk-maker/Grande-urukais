import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DomainEvent {
  type: string;
  payload: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class MessagingService implements OnModuleInit {
  private readonly logger = new Logger(MessagingService.name);
  private channel: any;
  private connected = false;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const rabbitUrl = this.config.get<string>('RABBITMQ_URL');
    if (!rabbitUrl) {
      this.logger.warn('RABBITMQ_URL not set — messaging disabled');
      return;
    }

    try {
      const amqp = await import('amqplib');
      const connection = await amqp.connect(rabbitUrl);
      this.channel = await connection.createChannel();

      connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.connected = false;
      });

      // Declare exchange
      await this.channel.assertExchange('urukais.events', 'topic', { durable: true });
      this.connected = true;
      this.logger.log('RabbitMQ connected');
    } catch (err: any) {
      this.logger.warn(`RabbitMQ connection failed: ${err.message} — messaging disabled`);
    }
  }

  async publish(event: Omit<DomainEvent, 'timestamp'>): Promise<void> {
    if (!this.connected || !this.channel) {
      this.logger.debug(`Messaging disabled — skipping event: ${event.type}`);
      return;
    }

    try {
      const message: DomainEvent = {
        ...event,
        timestamp: new Date().toISOString(),
      };

      const routingKey = event.type;
      this.channel.publish(
        'urukais.events',
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );
      this.logger.debug(`Event published: ${event.type}`);
    } catch (err: any) {
      this.logger.warn(`Failed to publish event ${event.type}: ${err.message}`);
    }
  }

  // Convenience methods for common events
  async publishOrderCreated(orderId: string, total: number, customerEmail: string): Promise<void> {
    await this.publish({
      type: 'order.created',
      payload: { orderId, total, customerEmail },
    });
  }

  async publishOrderStatusUpdated(orderId: string, status: string): Promise<void> {
    await this.publish({
      type: 'order.status.updated',
      payload: { orderId, status },
    });
  }

  async publishProductCreated(productId: string, name: string): Promise<void> {
    await this.publish({
      type: 'product.created',
      payload: { productId, name },
    });
  }

  async publishProductUpdated(productId: string, name: string): Promise<void> {
    await this.publish({
      type: 'product.updated',
      payload: { productId, name },
    });
  }
}
