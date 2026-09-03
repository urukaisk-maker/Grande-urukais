import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/orders.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Crear pedido e iniciar pago' })
  async checkout(@CurrentUser() user: AuthUser, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener pedidos del usuario' })
  async getOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.getOrders(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un pedido' })
  async getOrder(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ordersService.getOrder(user, id);
  }
}
