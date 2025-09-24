import { IsString, IsEmail, IsOptional } from 'class-validator';

export class TestEmailDto {
  @IsEmail()
  toEmail: string;

  @IsString()
  subject: string;

  @IsString()
  template: string;

  @IsOptional()
  templateData?: Record<string, any>;
}

export class EmailHealthResponseDto {
  status: 'healthy' | 'unhealthy' | 'pending';
  message: string;
  timestamp: Date;
  details?: Record<string, any>;
}
