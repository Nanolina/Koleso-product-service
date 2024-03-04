import { IsDefined, IsObject, IsUUID } from 'class-validator';
import { FilterDto } from './filter.dto';

export class FindAllDto {
  @IsDefined()
  @IsUUID()
  userId: string;

  @IsDefined()
  @IsObject()
  filter: FilterDto;
}
