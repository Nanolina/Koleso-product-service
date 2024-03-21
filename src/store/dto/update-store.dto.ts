import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateStoreDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  isRemoveImage?: string; // 'true'
}
