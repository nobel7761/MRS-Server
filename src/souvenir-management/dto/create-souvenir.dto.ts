import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
  ValidateIf,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
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
  photoUrl?: string; // Will be set by interceptor from Cloudinary (for non-photo-gallery)

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMinSize(1, {
    message: 'At least 1 photo is required for photo-gallery',
  })
  @ArrayMaxSize(10, { message: 'Maximum 10 photos allowed for photo-gallery' })
  photoUrls?: string[]; // Will be set by interceptor from Cloudinary (for photo-gallery)

  @ValidateIf((o) => o.category !== 'photo-gallery')
  @IsString()
  @IsNotEmpty({
    message: 'Content is required for non-photo-gallery categories',
  })
  content?: string; // HTML content from rich text editor (required for non-photo-gallery, optional for photo-gallery)

  @ValidateIf(
    (o) => o.professionalDetails !== '' && o.professionalDetails !== null,
  )
  @IsString()
  @IsOptional()
  @MaxLength(150)
  professionalDetails?: string;
}
