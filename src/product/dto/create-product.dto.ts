import { GenderType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
  ValidateNested,
} from 'class-validator';
import { IsValidGenderConstraint } from '../validators';
import { CompositionDto } from './composition.dto';
import { ParameterDto } from './parameter.dto';

export class CreateProductDto {
  @IsDefined()
  @IsUUID()
  storeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDefined()
  @IsUUID()
  groupId: string;

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

  @IsNumber()
  @IsDefined()
  priceWithoutDiscount: number;

  @IsNumber()
  @IsDefined()
  finalPrice: number;

  @IsOptional()
  @Validate(IsValidGenderConstraint)
  gender?: GenderType;

  @IsNumber()
  @IsDefined()
  sectionId: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  subcategoryId?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CompositionDto)
  composition?: CompositionDto[];

  @IsArray()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => ParameterDto)
  parameters: ParameterDto[];
}
