import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateIf,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
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
  photoUrl?: string; // Will be set by interceptor from Cloudinary (for non-photo-gallery)

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMinSize(1, {
    message: 'At least 1 photo is required for photo-gallery',
  })
  @ArrayMaxSize(10, { message: 'Maximum 10 photos allowed for photo-gallery' })
  photoUrls?: string[]; // Will be set by interceptor from Cloudinary (for photo-gallery)

  @IsString()
  @IsOptional()
  content?: string; // HTML content from rich text editor

  @ValidateIf(
    (o) => o.professionalDetails !== '' && o.professionalDetails !== null,
  )
  @IsString()
  @IsOptional()
  @MaxLength(150)
  professionalDetails?: string;
}
