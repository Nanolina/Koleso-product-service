import { ColorType } from '@prisma/client';
import { IsArray, IsDefined, Validate } from 'class-validator';
import { IsValidColorConstraint } from '../validators';

export class ColorsWithImagesDto {
  @IsDefined()
  @Validate(IsValidColorConstraint)
  color: ColorType;

  @IsArray()
  @IsDefined()
  images: string[];
}
