import { GenderType } from '@prisma/client';
import {
  IsDefined,
  IsJSON,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';
import { IsValidGenderConstraint } from '../validators';

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

  @IsNumberString()
  @IsDefined()
  priceWithoutDiscount: string;

  @IsNumberString()
  @IsDefined()
  finalPrice: string;

  @IsOptional()
  @Validate(IsValidGenderConstraint)
  gender?: GenderType;

  @IsNumberString()
  @IsDefined()
  sectionId: string;

  @IsNumberString()
  @IsOptional()
  categoryId?: string;

  @IsNumberString()
  @IsOptional()
  subcategoryId?: string;

  @IsJSON()
  @IsOptional()
  composition?: string;
}
