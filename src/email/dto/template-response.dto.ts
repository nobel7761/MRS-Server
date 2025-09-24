import { IsString, IsArray, IsObject, IsOptional } from 'class-validator';

export class TemplateContextFieldDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;
}

export class TemplateExampleDataDto {
  @IsString()
  @IsOptional()
  eventName?: string;

  @IsString()
  @IsOptional()
  eventDate?: string;

  @IsString()
  @IsOptional()
  eventTime?: string;

  @IsString()
  @IsOptional()
  eventLocation?: string;

  @IsString()
  @IsOptional()
  eventDescription?: string;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsString()
  @IsOptional()
  timeline?: string;

  @IsString()
  @IsOptional()
  contactInfo?: string;

  @IsString()
  @IsOptional()
  socialLinks?: string;

  @IsString()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  hscPassingYear?: string;

  @IsString()
  @IsOptional()
  currentYear?: string;

  [key: string]: any; // Allow additional properties
}

export class TemplateInfoDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  contextFields: string[];
}

export class TemplatesResponseDto {
  @IsArray()
  templates: TemplateInfoDto[];
}
