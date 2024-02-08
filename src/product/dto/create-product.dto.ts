import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  articleSupplier?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  // @IsNumber()
  // @IsDefined()
  // priceWithoutDiscount: string;

  // @IsNumber()
  // @IsDefined()
  // finalPrice: string;
}
