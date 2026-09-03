import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAddressDto } from './dto/addresses.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async getAddresses(user: AuthUser) {
    return this.prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(user: AuthUser, dto: CreateAddressDto) {
    // If this is the default address, unset any existing default
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId: user.id,
        label: dto.label,
        street: dto.street,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country || 'España',
        isDefault: dto.isDefault || false,
      },
    });
  }

  async deleteAddress(user: AuthUser, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    await this.prisma.address.delete({ where: { id } });
  }
}
