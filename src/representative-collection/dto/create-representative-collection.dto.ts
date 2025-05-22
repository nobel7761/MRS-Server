import { IsString, IsNumber, IsUrl, IsOptional, IsEnum } from 'class-validator';

export class CreateRepresentativeCollectionDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsUrl()
  facebookUrl: string;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsNumber()
  hscYear: number;

  @IsString()
  hscGroup: string;

  @IsString()
  gender: string;
}
