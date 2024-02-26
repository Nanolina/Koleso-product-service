import { ColorType } from '@prisma/client';
import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { IsValidColorConstraint } from '../../product/validators';

export class VariantDto {
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
}
