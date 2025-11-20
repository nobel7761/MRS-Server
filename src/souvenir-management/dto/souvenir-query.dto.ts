import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SouvenirQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  batch?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  search?: string; // Search by name or email

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
