import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { ProductQueryDto } from '../../common/dto/pagination-query.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Catalog')
@Controller()
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  async getCategories() {
    return this.catalogService.getCategories();
  }

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'Obtener productos con paginación y filtros' })
  async getProducts(@Query() query: ProductQueryDto) {
    return this.catalogService.getProducts(query);
  }

  @Public()
  @Get('products/:id')
  @ApiOperation({ summary: 'Obtener detalle de un producto' })
  async getProduct(@Param('id') id: string) {
    return this.catalogService.getProduct(id);
  }
}
