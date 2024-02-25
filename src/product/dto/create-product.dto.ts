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
import { VariantDto } from './variant.dto';

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
  @Type(() => VariantDto)
  variants?: VariantDto[];
}
