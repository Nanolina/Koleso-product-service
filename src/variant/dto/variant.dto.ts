import { ColorType } from '@prisma/client';
import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';
import { IsValidColorConstraint } from '../../product/validators';

export class VariantDto {
  // For create new variant
  @IsDefined()
  @Validate(IsValidColorConstraint)
  color: ColorType;

  @IsDefined()
  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  @IsDefined()
  priceWithoutDiscount: number;

  @IsNumber()
  @IsDefined()
  finalPrice: number;

  @IsString()
  @IsOptional()
  articleSupplier?: string;

  // For update existing variant
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsString()
  articleKoleso?: string;
}
