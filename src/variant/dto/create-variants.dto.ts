import { Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { VariantDto } from './variant.dto';

export class CreateVariantsDto {
  @IsArray()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];
}
