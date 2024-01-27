import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateStoreDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  //   logo: string;
}

export class UpdateStoreServiceDto extends UpdateStoreDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsString()
  @IsUUID()
  userId: string;
}
