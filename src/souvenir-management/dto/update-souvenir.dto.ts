import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSouvenirDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  batch?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  group?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string; // Will be set by interceptor from Cloudinary

  @IsString()
  @IsOptional()
  content?: string; // HTML content from rich text editor
}
