import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  unitPrice!: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  quantity!: number;
}

export class CheckoutDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerEmail!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiProperty({ type: [CheckoutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];
}
