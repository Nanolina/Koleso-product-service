import { IsDefined, IsObject, IsUUID } from 'class-validator';
import { FilterDto } from './filter.dto';

export class FindOneDto {
  @IsDefined()
  @IsUUID()
  id: string;

  @IsDefined()
  @IsUUID()
  organizationId: string;

  @IsDefined()
  @IsObject()
  filterVariants: FilterDto;
}
