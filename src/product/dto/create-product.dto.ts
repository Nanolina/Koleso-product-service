import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsDefined()
  @IsUUID()
  storeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  articleSupplier?: string;

  // @IsNumber()
  // @IsDefined()
  // priceWithoutDiscount: string;

  // @IsNumber()
  // @IsDefined()
  // finalPrice: string;
}
