import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  CreateCategoryDto, UpdateCategoryDto,
  CreateProductDto, UpdateProductDto,
  UpdateOrderStatusDto, UpdateUserRoleDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ─── Stats ────────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  async getStats() {
    return this.adminService.getStats();
  }

  // ─── Categories ──────────────────────────────────────

  @Get('categories')
  @ApiOperation({ summary: 'Listar todas las categorías (admin)' })
  async getAllCategories() {
    return this.adminService.getAllCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Crear categoría' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Eliminar categoría' })
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // ─── Products ────────────────────────────────────────

  @Get('products')
  @ApiOperation({ summary: 'Listar productos (admin, con inactivos)' })
  async getAllProducts(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllProducts(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Obtener producto (admin)' })
  async getProduct(@Param('id') id: string) {
    return this.adminService.getProduct(id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Crear producto' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.adminService.createProduct(dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Actualizar producto' })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Eliminar producto' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // ─── Orders ──────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: 'Listar todos los pedidos' })
  async getAllOrders(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllOrders(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Obtener detalle de un pedido' })
  async getOrder(@Param('id') id: string) {
    return this.adminService.getOrder(id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Actualizar estado del pedido' })
  async updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.adminService.updateOrderStatus(id, dto);
  }

  // ─── Users ───────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'Listar usuarios' })
  async getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Cambiar rol de usuario' })
  async updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto);
  }

  // ─── Reviews ─────────────────────────────────────────

  @Get('reviews')
  @ApiOperation({ summary: 'Listar todas las reseñas' })
  async getAllReviews(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllReviews(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Eliminar reseña' })
  async deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }
}
