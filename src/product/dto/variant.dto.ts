import { ColorType } from '@prisma/client';
import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';
import { IsValidColorConstraint } from '../validators';

export class VariantDto {
  @IsDefined()
  @IsUUID()
  id: string;

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
