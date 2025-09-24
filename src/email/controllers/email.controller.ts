import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { TestEmailDto, EmailHealthResponseDto } from '../dto/test-email.dto';
import { TemplatesResponseDto } from '../dto/template-response.dto';

@Controller('email')
// @UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // ==================== EMAIL TEST CONFIGURATION ====================

  @Get('health')
  async getServiceHealth(): Promise<EmailHealthResponseDto> {
    try {
      const health = await this.emailService.checkHealth();
      return {
        status: health.status as 'healthy' | 'unhealthy' | 'pending',
        message: health.message,
        timestamp: health.timestamp,
        details: health.details,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to check email service health',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('test-configuration')
  async testConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      const testEmail = 'nic.alumniassociation.official@gmail.com';
      const result = await this.emailService.sendTestEmail(
        testEmail,
        'Email Service Configuration Test',
        'silver-jubilee-announcement',
        {
          announcementDate: new Date().toLocaleDateString(),
          establishmentYear: 1999,
          currentYear: new Date().getFullYear(),
        },
      );

      return {
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to send test email: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-test')
  async sendTestEmail(
    @Body() testEmailDto: TestEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    // console.log(testEmailDto);
    try {
      const result = await this.emailService.sendTestEmail(
        testEmailDto.toEmail,
        testEmailDto.subject,
        testEmailDto.template,
        testEmailDto.templateData,
      );

      return {
        success: true,
        message: `Test email sent successfully to ${testEmailDto.toEmail}`,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to send test email: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('templates')
  async getAvailableTemplates(): Promise<TemplatesResponseDto> {
    try {
      const templates = this.emailService.getAvailableTemplates();
      return { templates };
    } catch (error) {
      throw new HttpException(
        'Failed to get available templates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
