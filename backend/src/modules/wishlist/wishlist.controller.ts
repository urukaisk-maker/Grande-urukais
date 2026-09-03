import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener wishlist del usuario' })
  async getWishlist(@CurrentUser() user: AuthUser) {
    return this.wishlistService.getWishlist(user);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Añadir producto a la wishlist' })
  async addToWishlist(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.wishlistService.addToWishlist(user, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Eliminar producto de la wishlist' })
  async removeFromWishlist(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    await this.wishlistService.removeFromWishlist(user, productId);
    return { success: true };
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Verificar si un producto está en la wishlist' })
  async isFavorite(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    const result = await this.wishlistService.isFavorite(user, productId);
    return result;
  }
}
