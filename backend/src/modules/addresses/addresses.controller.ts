import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/addresses.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener direcciones del usuario' })
  async getAddresses(@CurrentUser() user: AuthUser) {
    return this.addressesService.getAddresses(user);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva dirección' })
  async createAddress(@CurrentUser() user: AuthUser, @Body() dto: CreateAddressDto) {
    return this.addressesService.createAddress(user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar dirección' })
  async deleteAddress(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.addressesService.deleteAddress(user, id);
    return { success: true };
  }
}
