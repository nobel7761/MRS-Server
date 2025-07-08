import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateFaqsCategoryDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
