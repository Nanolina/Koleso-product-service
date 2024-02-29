import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class ColorImagesDto {
  @IsString()
  color: string;

  @IsUrl({}, { each: true })
  images: string[];
}

export class UpdateImagesForVariantsDto {
  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => ColorImagesDto)
  colors?: Record<string, ColorImagesDto[]>;
}
