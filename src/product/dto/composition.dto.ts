import { IsDefined, IsNumber, IsString } from 'class-validator';

export class CompositionDto {
  @IsString()
  @IsDefined()
  title: string;

  @IsNumber()
  @IsDefined()
  percentage: number;
}
