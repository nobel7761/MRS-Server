import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private isHealthy = false;
  private lastHealthCheck: Date | null = null;

  constructor(private configService: ConfigService) {
    // Don't initialize immediately - wait for first use
  }

  private async initializeTransporter() {
    try {
      const emailUser = this.configService.get('EMAIL_USER');
      const emailPassword = this.configService.get('EMAIL_PASSWORD');

      if (!emailUser || !emailPassword) {
        throw new Error(
          'EMAIL_USER and EMAIL_PASSWORD environment variables are required',
        );
      }

      this.transporter = nodemailer.createTransport({
        host: this.configService.get('EMAIL_HOST', 'smtp.gmail.com'),
        port: this.configService.get('EMAIL_PORT', 587),
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.isHealthy = true;
      this.lastHealthCheck = new Date();
      this.logger.log('Email service initialized successfully');
    } catch (error) {
      this.isHealthy = false;
      this.logger.error('Failed to initialize email service:', error);
      throw error; // Re-throw to let calling code handle it
    }
  }

  async checkHealth(): Promise<{
    status: 'healthy' | 'unhealthy' | 'pending';
    message: string;
    timestamp: Date;
    details: Record<string, any>;
  }> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      await this.transporter.verify();
      this.isHealthy = true;
      this.lastHealthCheck = new Date();

      return {
        status: 'healthy',
        message: 'Email service is operational',
        timestamp: this.lastHealthCheck,
        details: {
          host: this.configService.get(
            process.env.EMAIL_HOST || 'smtp.gmail.com',
          ),
          port: this.configService.get(process.env.EMAIL_PORT || '587'),
          user: this.configService.get(
            process.env.EMAIL_USER ||
              'nic.alumniassociation.official@gmail.com',
          ),
        },
      };
    } catch (error) {
      this.isHealthy = false;
      this.logger.error('Email service health check failed:', error);

      return {
        status: 'unhealthy',
        message: 'Email service is not operational',
        timestamp: new Date(),
        details: {
          error: error.message,
          missingCredentials:
            !this.configService.get('EMAIL_USER') ||
            !this.configService.get('EMAIL_PASSWORD'),
        },
      };
    }
  }

  async sendTestEmail(
    toEmail: string,
    subject: string,
    templateName: string,
    templateData?: Record<string, any>,
  ): Promise<{
    success: boolean;
    messageId: string;
    recipient: string;
  }> {
    try {
      // Ensure transporter is initialized
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      this.logger.log(
        `Template data received: ${JSON.stringify(templateData || {}, null, 2)}`,
      );
      const html = await this.renderTemplate(templateName, templateData || {});

      // Hardcode the display name to ensure it works
      const emailUser = this.configService.get('EMAIL_USER');
      const fromField = `"National Ideal College Alumni Association" <${emailUser}>`;

      const mailOptions = {
        from: fromField,
        to: toEmail,
        subject: subject,
        html: html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Test email sent successfully to ${toEmail}`);

      return {
        success: true,
        messageId: result.messageId,
        recipient: toEmail,
      };
    } catch (error) {
      this.logger.error(`Failed to send test email to ${toEmail}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendBulkEmail(
    recipients: Array<{
      email: string;
      firstName?: string;
      lastName?: string;
      hscPassingYear?: number;
    }>,
    subject: string,
    templateName: string,
    templateData?: Record<string, any>,
  ) {
    // Ensure transporter is initialized
    if (!this.transporter) {
      await this.initializeTransporter();
    }

    const results: Array<{
      email: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }> = [];

    for (const recipient of recipients) {
      try {
        const personalizedData = {
          ...templateData,
          recipientEmail: recipient.email,
          firstName: recipient.firstName || '',
          lastName: recipient.lastName || '',
          hscPassingYear: recipient.hscPassingYear || '',
          currentYear: new Date().getFullYear(),
        };

        const html = await this.renderTemplate(templateName, personalizedData);

        // Hardcode the display name to ensure it works
        const emailUser = this.configService.get('EMAIL_USER');
        const fromField = `"National Ideal College Alumni Association" <${emailUser}>`;

        const mailOptions = {
          from: fromField,
          to: recipient.email,
          subject: subject,
          html: html,
        };

        const result = await this.transporter.sendMail(mailOptions);
        results.push({
          email: recipient.email,
          success: true,
          messageId: result.messageId,
        });

        this.logger.log(`Email sent successfully to ${recipient.email}`);
      } catch (error) {
        results.push({
          email: recipient.email,
          success: false,
          error: error.message,
        });

        this.logger.error(`Failed to send email to ${recipient.email}:`, error);
      }
    }

    return results;
  }

  private async renderTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    try {
      this.logger.log(`Rendering template: ${templateName}`);
      this.logger.log(`Template data: ${JSON.stringify(data, null, 2)}`);

      const templatePath = path.join(
        __dirname,
        '../templates',
        `${templateName}.hbs`,
      );

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template ${templateName} not found`);
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      this.logger.log(
        `Template content length: ${templateContent.length} characters`,
      );

      const template = handlebars.compile(templateContent);
      const renderedHtml = template(data);

      this.logger.log(
        `Template rendered successfully. HTML length: ${renderedHtml.length} characters`,
      );

      return renderedHtml;
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}:`, error);
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  getAvailableTemplates(): Array<{
    name: string;
    description: string;
    contextFields: string[];
  }> {
    try {
      const templatesDir = path.join(__dirname, '../templates');
      if (!fs.existsSync(templatesDir)) {
        return [];
      }

      const files = fs.readdirSync(templatesDir);
      const templates: Array<{
        name: string;
        description: string;
        contextFields: string[];
      }> = [];

      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templateInfo = this.getTemplateInfo(templateName);
          templates.push(templateInfo);
        }
      }

      return templates;
    } catch (error) {
      this.logger.error('Failed to get available templates:', error);
      return [];
    }
  }

  private getTemplateInfo(templateName: string): {
    name: string;
    description: string;
    contextFields: string[];
  } {
    // Define template information for each template
    const templateInfo: Record<
      string,
      {
        description: string;
        contextFields: string[];
      }
    > = {
      'silver-jubilee-announcement': {
        description:
          'National Ideal College Silver Jubilee announcement template',
        contextFields: [
          'announcementDate (string)',
          'establishmentYear (number)',
          'openingCeremony (string)',
          'culturalEvent (string)',
          'alumniReunion (string)',
          'academicSymposium (string)',
          'closingGala (string)',
          'foundationWeekDate (string)',
          'academicWeekDate (string)',
          'communityWeekDate (string)',
          'grandFinaleDate (string)',
          'daysUntilEvent (number)',
          'registrationLink (string)',
          'scheduleLink (string)',
          'contactEmail (string)',
          'contactPhone (string)',
          'websiteUrl (string)',
          'collegeAddress (string)',
          'collegeCity (string)',
          'collegeState (string)',
          'collegeZipCode (string)',
          'facebookUrl (string)',
          'twitterUrl (string)',
          'instagramUrl (string)',
          'linkedinUrl (string)',
          'currentYear (number)',
          'recipientEmail (string)',
          'unsubscribeLink (string)',
        ],
      },
      // Add more templates here as needed
    };

    const defaultInfo = {
      description: `${templateName} email template`,
      contextFields: [
        'recipientEmail (string)',
        'firstName (string)',
        'lastName (string)',
        'hscPassingYear (number)',
        'currentYear (number)',
      ],
    };

    return {
      name: templateName,
      ...(templateInfo[templateName] || defaultInfo),
    };
  }

  isServiceHealthy(): boolean {
    return this.isHealthy;
  }

  getLastHealthCheck(): Date | null {
    return this.lastHealthCheck;
  }
}
