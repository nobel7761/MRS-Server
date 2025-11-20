import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateSouvenirDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string; // e.g., "memory-writeup"

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  batch: string; // e.g., "2015"

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  group: string; // e.g., "science"

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(20)
  phoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  photoUrl?: string; // Will be set by interceptor from Cloudinary

  @IsString()
  @IsNotEmpty()
  content: string; // HTML content from rich text editor
}
