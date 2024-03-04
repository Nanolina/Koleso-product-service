import { IsDefined, IsEnum } from 'class-validator';

export enum VariantType {
  Active = 'active',
  Deleted = 'deleted',
}

export class FilterDto {
  @IsDefined()
  @IsEnum(VariantType)
  type: VariantType;
}
