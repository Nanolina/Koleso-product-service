import { GenderType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
  ValidateNested,
} from 'class-validator';
import { IsValidGenderConstraint } from '../validators';
import { CompositionDto } from './composition.dto';

export class UpdateProductDto {
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsString()
  @IsOptional()
  name?: string;

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
  @IsOptional()
  sectionId?: number;

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
}
