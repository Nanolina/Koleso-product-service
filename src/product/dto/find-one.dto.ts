import { IsDefined, IsObject, IsUUID } from 'class-validator';
import { FilterDto } from './filter.dto';

export class FindOneDto {
  @IsDefined()
  @IsUUID()
  id: string;

  @IsDefined()
  @IsUUID()
  userId: string;

  @IsDefined()
  @IsObject()
  filterVariants: FilterDto;
}
