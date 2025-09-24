import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsDateString,
  Min,
  MaxLength,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, EventVisibility } from '../enums/event.enum';

export class PricingRangeDto {
  @IsString()
  @IsNotEmpty()
  batchRange: string;

  @IsNumber()
  @Min(0)
  fee: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;
}

export class SocialMediaLinksDto {
  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  website?: string;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  fullDescription: string;

  @IsString()
  @IsOptional()
  bannerImage?: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  startsTime: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsOptional()
  @IsString()
  googleMapLink?: string;

  @IsString()
  @IsNotEmpty()
  organizerName: string;

  @IsString()
  @IsNotEmpty()
  organizerContactInfo: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialGuests?: string[];

  @IsBoolean()
  isPaidEvent: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingRangeDto)
  @IsOptional()
  pricingRanges?: PricingRangeDto[];

  @IsNumber()
  @Min(1)
  seatLimit: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialMediaLinksDto)
  socialMediaLinks?: SocialMediaLinksDto;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility;
}
