import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Casa' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ example: 'Calle Mayor 5' })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ example: 'Madrid' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: '28001' })
  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @ApiPropertyOptional({ example: 'España', default: 'España' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
