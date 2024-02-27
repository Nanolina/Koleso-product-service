import { Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { VariantDto } from './variant.dto';

export class UpdateVariantsDto {
  @IsArray()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];
}
