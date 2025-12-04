import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SilverJubileeParticipant,
  SilverJubileeParticipantDocument,
} from './schemas/silver-jubilee.schema';
import {
  CreateSilverJubileeParticipantDto,
  UpdateSilverJubileeParticipantDto,
} from './dto/silver-jubilee.dto';
import { JwtPayload } from '../auth/jwt-payload';
import { EmailService } from '../email/services/email.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import {
  SilverJubileeParticipantCategory,
  SilverJubileeGroup,
  SilverJubileeGender,
  SilverJubileeBloodGroup,
  SilverJubileePaymentType,
} from './enums/silver-jubilee.enum';

@Injectable()
export class SilverJubileeService {
  constructor(
    @InjectModel(SilverJubileeParticipant.name)
    private participantModel: Model<SilverJubileeParticipantDocument>,
    private emailService: EmailService,
  ) {}

  async create(
    createDto: CreateSilverJubileeParticipantDto,
    user?: JwtPayload,
  ) {
    try {
      // Validate required fields based on participant category
      await this.validateParticipantData(createDto);

      // Check if participant with same email or phone already exists (only for non-guests and non-babies)
      if (
        createDto.participantCategory !== 'Guest' &&
        createDto.participantCategory !== 'Baby' &&
        (createDto.email || createDto.phoneNumber)
      ) {
        const existingParticipant = await this.participantModel.findOne({
          $or: [
            { email: createDto.email },
            { phoneNumber: createDto.phoneNumber },
          ],
        });

        if (existingParticipant) {
          throw new BadRequestException(
            'Participant with this email or phone number already registered',
          );
        }
      }

      // Generate unique secret code
      const secretCode = await this.generateUniqueSecretCode(createDto);

      const participant = new this.participantModel({
        ...createDto,
        secretCode,
        formFilledUpBy: user?._id, // Store the logged-in user's ID as formFilledUpBy when available
      });

      const savedParticipant = await participant.save();
      return savedParticipant;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create participant: ${error.message}`,
      );
    }
  }

  private async generateUniqueSecretCode(
    createDto: CreateSilverJubileeParticipantDto,
  ): Promise<string> {
    let secretCode: string = '';
    let isUnique = false;

    while (!isUnique) {
      secretCode = this.generateSecretCode(createDto);

      // Check if secret code already exists
      const existingParticipant = await this.participantModel.findOne({
        secretCode,
      });

      if (!existingParticipant) {
        isUnique = true;
      }
    }

    return secretCode;
  }

  private generateSecretCode(
    createDto: CreateSilverJubileeParticipantDto,
  ): string {
    // Get batch (last 2 digits of year, padded with zeros)
    let batchYear: number;
    if (
      createDto.participantCategory === 'Guest' ||
      createDto.participantCategory === 'Baby'
    ) {
      batchYear = createDto.mainParticipantBatch || 0;
    } else {
      batchYear = createDto.hscPassingYear || 0;
    }

    // Get last 2 digits and pad with leading zero if needed
    const batch = String(batchYear % 100).padStart(2, '0');

    // Get group code (01=Science, 02=Business Studies, 03=Humanities)
    let groupCode: string;
    const group =
      createDto.participantCategory === 'Guest' ||
      createDto.participantCategory === 'Baby'
        ? createDto.mainParticipantGroup
        : createDto.group;

    switch (group) {
      case 'Science':
        groupCode = '01';
        break;
      case 'Business Studies':
        groupCode = '02';
        break;
      case 'Humanities':
        groupCode = '03';
        break;
      default:
        groupCode = '00';
    }

    // Get current date and month
    const now = new Date();
    const date = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Generate 6-digit random number
    const randomNumber = String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      '0',
    );

    // Format: {batch}-{groupCode}-{date}-{month}-{randomNumber}
    return `${batch}-${groupCode}-${date}-${month}-${randomNumber}`;
  }

  private async validateParticipantData(
    createDto: CreateSilverJubileeParticipantDto,
  ): Promise<void> {
    const { participantCategory } = createDto;

    if (participantCategory === 'Guest') {
      // Validate guest-specific fields
      if (!createDto.mainParticipantBatch) {
        throw new BadRequestException(
          'Main participant batch is required for guests',
        );
      }
      if (!createDto.mainParticipantGroup) {
        throw new BadRequestException(
          'Main participant group is required for guests',
        );
      }
      if (!createDto.guestName) {
        throw new BadRequestException('Guest name is required for guests');
      }
      if (!createDto.guestMobileNumber) {
        throw new BadRequestException(
          'Guest mobile number is required for guests',
        );
      }

      // If mainParticipantId is provided, fetch and store main participant details
      if (createDto.mainParticipantId) {
        const mainParticipant = await this.participantModel
          .findById(createDto.mainParticipantId)
          .exec();

        if (!mainParticipant) {
          throw new BadRequestException(
            `Main participant with ID ${createDto.mainParticipantId} not found`,
          );
        }

        // Store main participant's name and ID
        createDto.mainParticipantName = mainParticipant.fullName;
      }
    } else if (participantCategory === 'Baby') {
      // Validate baby-specific fields
      if (!createDto.mainParticipantBatch) {
        throw new BadRequestException(
          'Main participant batch is required for babies',
        );
      }
      if (!createDto.mainParticipantGroup) {
        throw new BadRequestException(
          'Main participant group is required for babies',
        );
      }
      if (!createDto.mainParticipantId) {
        throw new BadRequestException(
          'Main participant ID is required for babies',
        );
      }
      if (!createDto.babyName) {
        throw new BadRequestException('Baby name is required for babies');
      }
      if (!createDto.babyPhone) {
        throw new BadRequestException('Baby phone is required for babies');
      }

      // Fetch and store main participant details
      const mainParticipant = await this.participantModel
        .findById(createDto.mainParticipantId)
        .exec();

      if (!mainParticipant) {
        throw new BadRequestException(
          `Main participant with ID ${createDto.mainParticipantId} not found`,
        );
      }

      // Store main participant's name and ID
      createDto.mainParticipantName = mainParticipant.fullName;
    } else {
      // Validate personal information for non-guest participants
      const requiredFields = [
        { field: 'fullName', message: 'Full name is required' },
        { field: 'phoneNumber', message: 'Phone number is required' },
        { field: 'email', message: 'Email is required' },
        { field: 'hscPassingYear', message: 'HSC passing year is required' },
        { field: 'group', message: 'Group is required' },
        { field: 'gender', message: 'Gender is required' },
        { field: 'bloodGroup', message: 'Blood group is required' },
        // { field: 'fatherName', message: 'Father name is required' },
        // {
        //   field: 'fatherPhoneNumber',
        //   message: 'Father phone number is required',
        // },
        // {
        //   field: 'fatherOccupation',
        //   message: 'Father occupation is required',
        // },
        // { field: 'motherName', message: 'Mother name is required' },
        // {
        //   field: 'motherPhoneNumber',
        //   message: 'Mother phone number is required',
        // },
        // {
        //   field: 'motherOccupation',
        //   message: 'Mother occupation is required',
        // },
      ];

      for (const { field, message } of requiredFields) {
        if (!createDto[field]) {
          throw new BadRequestException(message);
        }
      }
    }
  }

  async findAll() {
    try {
      // Execute query - get all participants sorted by creation date (newest first)
      const participants = await this.participantModel
        .find()
        .sort({ createdAt: -1 })
        .populate('registeredUnder', 'firstName lastName email')
        .populate('formFilledUpBy', 'firstName lastName email')
        .exec();

      // Return array directly
      return participants;
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch participants: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const participant = await this.participantModel.findById(id).exec();

      if (!participant) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }

      return participant;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch participant: ${error.message}`,
      );
    }
  }

  async update(id: string, updateDto: UpdateSilverJubileeParticipantDto) {
    try {
      // If email or phone is being updated, check for duplicates
      if (updateDto.email || updateDto.phoneNumber) {
        const filter: any = {
          _id: { $ne: id },
        };

        if (updateDto.email || updateDto.phoneNumber) {
          filter.$or = [];
          if (updateDto.email) {
            filter.$or.push({ email: updateDto.email });
          }
          if (updateDto.phoneNumber) {
            filter.$or.push({ phoneNumber: updateDto.phoneNumber });
          }
        }

        const existingParticipant = await this.participantModel.findOne(filter);

        if (existingParticipant) {
          throw new BadRequestException(
            'Participant with this email or phone number already exists',
          );
        }
      }

      const updatedParticipant = await this.participantModel
        .findByIdAndUpdate(id, updateDto, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedParticipant) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }

      return updatedParticipant;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update participant: ${error.message}`,
      );
    }
  }

  async updatePaymentStatus(id: string, status: 'Paid' | 'Not Paid') {
    try {
      const participant = await this.participantModel.findById(id);

      if (!participant) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }

      participant.submittedFrom = status;
      const updatedParticipant = await participant.save();

      return {
        message: `Payment status updated to ${status} successfully`,
        participant: updatedParticipant,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update payment status: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const deletedParticipant = await this.participantModel
        .findByIdAndDelete(id)
        .exec();

      if (!deletedParticipant) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }

      return { message: 'Participant deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete participant: ${error.message}`,
      );
    }
  }

  async findByBatchAndGroup(batch: number, group: string) {
    try {
      const participants = await this.participantModel
        .find({
          hscPassingYear: batch,
          group: group,
        })
        .sort({ fullName: 1 })
        .exec();

      if (!participants || participants.length === 0) {
        throw new NotFoundException(
          `No participants found for batch ${batch} and group ${group}`,
        );
      }

      return {
        batch,
        group,
        total: participants.length,
        participants,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch participants by batch and group: ${error.message}`,
      );
    }
  }

  async sendParticipantEmail(participantId: string, user: JwtPayload) {
    try {
      // Find the participant
      const participant = await this.participantModel
        .findById(participantId)
        .exec();

      if (!participant) {
        throw new NotFoundException(
          `Participant with ID ${participantId} not found`,
        );
      }

      // Determine the recipient email based on participant category
      let recipientEmail: string;
      let recipientName: string;

      if (participant.participantCategory === 'Guest') {
        recipientName = participant.guestName || 'Guest';

        // Try to use guest's own email first
        if (participant.email) {
          recipientEmail = participant.email;
        } else {
          // If no email, fetch main participant's email
          if (!participant.mainParticipantId) {
            throw new BadRequestException(
              'Guest participant must have either an email or a main participant ID',
            );
          }

          const mainParticipant = await this.participantModel
            .findById(participant.mainParticipantId)
            .exec();

          if (!mainParticipant || !mainParticipant.email) {
            throw new BadRequestException(
              'Main participant not found or does not have an email address',
            );
          }

          recipientEmail = mainParticipant.email;
        }
      } else if (participant.participantCategory === 'Baby') {
        recipientName = participant.babyName || 'Baby';

        // Try to use baby's own email first
        if (participant.email) {
          recipientEmail = participant.email;
        } else {
          // If no email, fetch main participant's email
          if (!participant.mainParticipantId) {
            throw new BadRequestException(
              'Baby participant must have either an email or a main participant ID',
            );
          }

          const mainParticipant = await this.participantModel
            .findById(participant.mainParticipantId)
            .exec();

          if (!mainParticipant || !mainParticipant.email) {
            throw new BadRequestException(
              'Main participant not found or does not have an email address',
            );
          }

          recipientEmail = mainParticipant.email;
        }
      } else {
        if (!participant.email) {
          throw new BadRequestException(
            'Participant must have an email address',
          );
        }
        recipientEmail = participant.email;
        recipientName = participant.fullName || 'Participant';
      }

      // Prepare email template data
      const emailTemplateData = {
        recipientName: recipientName,
        fullName: recipientName,
        secretCode: participant.secretCode,
        entryCode: participant.secretCode, // Template uses {{entryCode}}
        participantCategory: participant.participantCategory,
        hscPassingYear:
          participant.hscPassingYear || participant.mainParticipantBatch,
        group: participant.group || participant.mainParticipantGroup,
        currentYear: new Date().getFullYear(),
        recipientEmail: recipientEmail,
      };

      // Prepare email subject
      const emailSubject = `🎉 Congratulations! Your Registration for the National Ideal College Silver Jubilee is Confirmed`;

      // Send the email
      const emailResult = await this.emailService.sendTestEmail(
        recipientEmail,
        emailSubject,
        'silver-jubilee-announcement',
        emailTemplateData,
      );

      // Get the full email HTML content for storage
      const emailContent = await this.renderEmailContent(
        'silver-jubilee-announcement',
        emailTemplateData,
      );

      // Create email sending detail
      const emailSendingDetail = {
        emailType: 'silver-jubilee-invitation',
        emailMetadata: {
          subject: emailSubject,
          to: recipientEmail,
          from: 'nic.alumniassociation.official@gmail.com',
          cc: [],
          bcc: [],
        },
        emailContent: emailContent,
        sentAt: new Date(),
        sentBy: {
          userId: user._id,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          role: user.role,
          system: false,
        },
        status: emailResult.success ? 'success' : 'failed',
        messageId: emailResult.messageId,
        notes: `Email sent to ${recipientName} (${recipientEmail})`,
      };

      // Update participant with email details
      participant.emailSendingDetails.push(emailSendingDetail);
      participant.isEmailSent = true;

      await participant.save();

      return {
        success: true,
        message: 'Email sent successfully',
        participant: {
          id: participant._id,
          name: recipientName,
          email: recipientEmail,
          secretCode: participant.secretCode,
          isEmailSent: participant.isEmailSent,
          totalEmailsSent: participant.emailSendingDetails.length,
          lastEmailSentAt: emailSendingDetail.sentAt,
        },
        emailDetails: emailSendingDetail,
      };
    } catch (error) {
      // If sending fails, still save the failed attempt
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Try to save the failed attempt
      try {
        const participant = await this.participantModel
          .findById(participantId)
          .exec();
        if (participant) {
          const failedEmailDetail = {
            emailType: 'silver-jubilee-invitation',
            emailMetadata: {
              subject: `🎉 Congratulations! Your Registration for the National Ideal College Silver Jubilee is Confirmed`,
              to: participant.email || 'unknown',
              from: 'nic.alumniassociation.official@gmail.com',
              cc: [],
              bcc: [],
            },
            emailContent: '',
            sentAt: new Date(),
            sentBy: {
              userId: user._id,
              userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              role: user.role,
              system: false,
            },
            status: 'failed',
            error: error.message,
            notes: 'Email sending failed',
          };

          participant.emailSendingDetails.push(failedEmailDetail);
          await participant.save();
        }
      } catch (saveError) {
        // Log but don't throw
        console.error('Failed to save error details:', saveError);
      }

      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  private async renderEmailContent(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    try {
      // Use handlebars to render the template
      const fs = require('fs');
      const path = require('path');
      const handlebars = require('handlebars');

      const templatePath = path.join(
        __dirname,
        '../email/templates',
        `${templateName}.hbs`,
      );

      if (!fs.existsSync(templatePath)) {
        return 'Email content not available';
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);
      return template(data);
    } catch (error) {
      console.error('Failed to render email content:', error);
      return 'Email content rendering failed';
    }
  }

  async uploadCsvAndCreateParticipants(
    file: Express.Multer.File,
    user: JwtPayload,
  ) {
    console.log('1');
    if (!file) {
      console.log('2');
      throw new BadRequestException('No file uploaded');
    }
    console.log('3');
    if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
      console.log('4');
      throw new BadRequestException('File must be a CSV file');
    }
    console.log('5');
    const results: SilverJubileeParticipant[] = [];
    const errors: Array<{ row: any; error: string }> = [];
    let successCount = 0;
    let errorCount = 0;
    console.log('6');
    return new Promise((resolve, reject) => {
      // Try different encodings to handle Bengali text properly
      let csvContent = '';
      try {
        csvContent = file.buffer.toString('utf8');
      } catch (error) {
        csvContent = file.buffer.toString('latin1');
      }

      console.log('CSV content preview:', csvContent.substring(0, 200));

      const stream = Readable.from(csvContent);
      console.log('7');
      stream
        .pipe(csv())
        .on('data', async (row) => {
          console.log('Processing CSV row:', row);
          try {
            const participantData = this.mapCsvRowToParticipant(row);
            console.log('Mapped participant data:', participantData);
            const participant = await this.createParticipantFromCsv(
              participantData,
              user,
            );
            console.log('Created participant:', participant);
            results.push(participant);
            successCount++;
          } catch (error) {
            console.log('Error processing row:', error.message);
            errors.push({
              row: row,
              error: error.message,
            });
            errorCount++;
          }
        })
        .on('end', () => {
          resolve({
            message: 'CSV processing completed',
            totalProcessed: successCount + errorCount,
            successCount,
            errorCount,
            successfulParticipants: results,
            errors,
          });
        })
        .on('error', (error) => {
          reject(
            new BadRequestException(`CSV parsing error: ${error.message}`),
          );
        });
    });
  }

  private mapCsvRowToParticipant(row: any): CreateSilverJubileeParticipantDto {
    // Debug: Log all available column names
    console.log('Available CSV columns:', Object.keys(row));
    console.log('Raw row data:', row);

    // Helper function to find column value with multiple possible names
    const findColumnValue = (
      possibleNames: string[],
      defaultValue: any = '',
    ) => {
      for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
          return row[name];
        }
      }
      return defaultValue;
    };

    // Try different possible column names for amount
    const amountValue = findColumnValue(
      [
        'রেজিস্ট্রেশন এমাউন্ট',
        'Registration Amount',
        'Amount',
        'amount',
        'রেজিস্ট্রেশন এমাউন্ট',
        'Registration_Amount',
        'AMOUNT',
      ],
      0,
    );

    console.log('Amount value found:', amountValue);
    console.log('Parsed amount:', parseFloat(amountValue));

    // Map CSV columns to our DTO fields using flexible column mapping
    const participantData: CreateSilverJubileeParticipantDto = {
      participantCategory: this.determineParticipantCategory(
        parseFloat(amountValue) || 0,
      ),
      fullName: findColumnValue([
        'Full Name',
        'fullName',
        'Full_Name',
        'Name',
        'name',
      ]),
      phoneNumber: findColumnValue([
        'Phone Number',
        'phoneNumber',
        'Phone_Number',
        'Phone',
        'phone',
      ]),
      alternativePhoneNumber: findColumnValue([
        'Alternative Phone Number',
        'alternativePhoneNumber',
        'Alternative_Phone_Number',
        'Alt Phone',
        'altPhone',
      ]),
      email: findColumnValue([
        'Email',
        'email',
        'EMAIL',
        'Email Address',
        'emailAddress',
      ]),
      hscPassingYear:
        parseInt(
          findColumnValue(
            [
              'HSC Passing Year',
              'hscPassingYear',
              'HSC_Passing_Year',
              'HSC Year',
              'hscYear',
            ],
            0,
          ),
        ) || undefined,
      group: this.mapGroup(
        findColumnValue(['Group', 'group', 'GROUP', 'Subject', 'subject']),
      ),
      gender: this.mapGender(
        findColumnValue(['Gender', 'gender', 'GENDER', 'Sex', 'sex']),
      ),
      bloodGroup: this.mapBloodGroup(
        findColumnValue([
          'Blood Group',
          'bloodGroup',
          'Blood_Group',
          'Blood',
          'blood',
        ]),
      ),
      paymentType: this.mapPaymentType(
        findColumnValue([
          'পেমেন্ট টাইপ',
          'Payment Type',
          'paymentType',
          'Payment_Type',
          'Payment',
          'payment',
        ]),
      ),
      amount: parseFloat(amountValue) || 0,
      comments: '',
      fatherName: findColumnValue([
        'Father Name',
        'fatherName',
        'Father_Name',
        'Father',
        'father',
      ]),
      fatherPhoneNumber: findColumnValue([
        'Father Phone Number',
        'fatherPhoneNumber',
        'Father_Phone_Number',
        'Father Phone',
        'fatherPhone',
      ]),
      fatherOccupation: findColumnValue([
        'Father Occupation',
        'fatherOccupation',
        'Father_Occupation',
        'Father Job',
        'fatherJob',
      ]),
      motherName: findColumnValue([
        'Mother Name',
        'motherName',
        'Mother_Name',
        'Mother',
        'mother',
      ]),
      motherPhoneNumber: findColumnValue([
        'Mother Phone Number',
        'motherPhoneNumber',
        'Mother_Phone_Number',
        'Mother Phone',
        'motherPhone',
      ]),
      motherOccupation: findColumnValue([
        'Mother Occupation',
        'motherOccupation',
        'Mother_Occupation',
        'Mother Job',
        'motherJob',
      ]),
      registeredUnder: '67f577c411236e7c9265935f',
    };

    console.log('Final participant data amount:', participantData.amount);
    return participantData;
  }

  private determineParticipantCategory(
    amount: number,
  ): SilverJubileeParticipantCategory {
    if (amount === 5000)
      return SilverJubileeParticipantCategory.LIFETIMEMEMBERSHIP;
    if (amount === 2000 || amount === 1600)
      return SilverJubileeParticipantCategory.ALUMNI;
    if (amount === 1400) return SilverJubileeParticipantCategory.STUDENT;
    if (amount === 1000) return SilverJubileeParticipantCategory.GUEST;
    if (amount === 500) return SilverJubileeParticipantCategory.BABY;

    // Default to ALUMNI if amount doesn't match any category
    return SilverJubileeParticipantCategory.ALUMNI;
  }

  private mapGroup(group: string): SilverJubileeGroup {
    const groupMap = {
      Science: SilverJubileeGroup.SCIENCE,
      'Business Studies': SilverJubileeGroup.BUSINESS_STUDIES,
      Humanities: SilverJubileeGroup.HUMANITIES,
    };
    return groupMap[group] || SilverJubileeGroup.SCIENCE;
  }

  private mapGender(gender: string): SilverJubileeGender {
    const genderMap = {
      Male: SilverJubileeGender.MALE,
      Female: SilverJubileeGender.FEMALE,
    };
    return genderMap[gender] || SilverJubileeGender.MALE;
  }

  private mapBloodGroup(bloodGroup: string): SilverJubileeBloodGroup {
    const bloodGroupMap = {
      'A+': SilverJubileeBloodGroup.A_POSITIVE,
      'A-': SilverJubileeBloodGroup.A_NEGATIVE,
      'B+': SilverJubileeBloodGroup.B_POSITIVE,
      'B-': SilverJubileeBloodGroup.B_NEGATIVE,
      'AB+': SilverJubileeBloodGroup.AB_POSITIVE,
      'AB-': SilverJubileeBloodGroup.AB_NEGATIVE,
      'O+': SilverJubileeBloodGroup.O_POSITIVE,
      'O-': SilverJubileeBloodGroup.O_NEGATIVE,
    };
    return bloodGroupMap[bloodGroup] || SilverJubileeBloodGroup.A_POSITIVE;
  }

  private mapPaymentType(paymentType: string): SilverJubileePaymentType {
    const paymentMap = {
      ক্যাশ: SilverJubileePaymentType.CASH,
      বিকাশ: SilverJubileePaymentType.BKASH,
      'ব্যাংক একাউন্ট': SilverJubileePaymentType.BANK_ACCOUNT,
    };
    return paymentMap[paymentType] || SilverJubileePaymentType.CASH;
  }

  private async createParticipantFromCsv(
    participantData: CreateSilverJubileeParticipantDto,
    user: JwtPayload,
  ): Promise<SilverJubileeParticipant> {
    console.log('participantData', participantData.fullName);
    // Validate required fields based on participant category
    await this.validateParticipantData(participantData);
    // Check if participant with same email or phone already exists
    if (participantData.email || participantData.phoneNumber) {
      const existingParticipant = await this.participantModel.findOne({
        $or: [
          { email: participantData.email },
          { phoneNumber: participantData.phoneNumber },
        ],
      });

      if (existingParticipant) {
        throw new BadRequestException(
          'Participant with this email or phone number already registered',
        );
      }
    }

    // Generate unique secret code
    const secretCode = await this.generateUniqueSecretCode(participantData);

    const participant = new this.participantModel({
      ...participantData,
      secretCode,
      formFilledUpBy: user._id,
    });
    console.log('participant length', participant);
    const savedParticipant = await participant.save();
    console.log(
      'savedParticipant length',
      Object.keys(savedParticipant).length,
    );
    return savedParticipant;
  }

  async getStatistics() {
    try {
      const allParticipants = await this.participantModel.find().exec();

      // Total counts
      const totalParticipants = allParticipants.length;

      // Count by participant category
      const byCategory = {
        Alumni: allParticipants.filter(
          (p) => p.participantCategory === 'Alumni',
        ).length,
        Student: allParticipants.filter(
          (p) => p.participantCategory === 'Student',
        ).length,
        Guest: allParticipants.filter((p) => p.participantCategory === 'Guest')
          .length,
        Baby: allParticipants.filter((p) => p.participantCategory === 'Baby')
          .length,
        LifetimeMembership: allParticipants.filter(
          (p) => p.participantCategory === 'Lifetime Membership',
        ).length,
      };

      // Revenue calculations
      const totalRevenue = allParticipants.reduce(
        (sum, p) => sum + p.amount,
        0,
      );
      const revenueByCategory = {
        Alumni: allParticipants
          .filter((p) => p.participantCategory === 'Alumni')
          .reduce((sum, p) => sum + p.amount, 0),
        Student: allParticipants
          .filter((p) => p.participantCategory === 'Student')
          .reduce((sum, p) => sum + p.amount, 0),
        Guest: allParticipants
          .filter((p) => p.participantCategory === 'Guest')
          .reduce((sum, p) => sum + p.amount, 0),
        Baby: allParticipants
          .filter((p) => p.participantCategory === 'Baby')
          .reduce((sum, p) => sum + p.amount, 0),
        LifetimeMembership: allParticipants
          .filter((p) => p.participantCategory === 'Lifetime Membership')
          .reduce((sum, p) => sum + p.amount, 0),
      };

      // Amount type breakdown
      const byAmountType = {
        Registration: allParticipants.filter(
          (p) => p.amountType === 'Registration',
        ).length,
        Donation: allParticipants.filter((p) => p.amountType === 'Donation')
          .length,
      };

      const revenueByAmountType = {
        Registration: allParticipants
          .filter((p) => p.amountType === 'Registration')
          .reduce((sum, p) => sum + p.amount, 0),
        Donation: allParticipants
          .filter((p) => p.amountType === 'Donation')
          .reduce((sum, p) => sum + p.amount, 0),
      };

      // Payment method breakdown
      const byPaymentMethod = {
        Bkash: allParticipants.filter((p) => p.paymentType === 'Bkash').length,
        Nagad: allParticipants.filter((p) => p.paymentType === 'Nagad').length,
        Cash: allParticipants.filter((p) => p.paymentType === 'Cash').length,
        BankAccount: allParticipants.filter(
          (p) => p.paymentType === 'Bank Account',
        ).length,
      };

      const revenueByPaymentMethod = {
        Bkash: allParticipants
          .filter((p) => p.paymentType === 'Bkash')
          .reduce((sum, p) => sum + p.amount, 0),
        Nagad: allParticipants
          .filter((p) => p.paymentType === 'Nagad')
          .reduce((sum, p) => sum + p.amount, 0),
        Cash: allParticipants
          .filter((p) => p.paymentType === 'Cash')
          .reduce((sum, p) => sum + p.amount, 0),
        BankAccount: allParticipants
          .filter((p) => p.paymentType === 'Bank Account')
          .reduce((sum, p) => sum + p.amount, 0),
      };

      // Group breakdown (excluding Guests and Babies)
      const alumniStudents = allParticipants.filter(
        (p) =>
          p.participantCategory !== 'Guest' && p.participantCategory !== 'Baby',
      );

      const byGroup = {
        Science: alumniStudents.filter((p) => p.group === 'Science').length,
        BusinessStudies: alumniStudents.filter(
          (p) => p.group === 'Business Studies',
        ).length,
        Humanities: alumniStudents.filter((p) => p.group === 'Humanities')
          .length,
      };

      const revenueByGroup = {
        Science: alumniStudents
          .filter((p) => p.group === 'Science')
          .reduce((sum, p) => sum + p.amount, 0),
        BusinessStudies: alumniStudents
          .filter((p) => p.group === 'Business Studies')
          .reduce((sum, p) => sum + p.amount, 0),
        Humanities: alumniStudents
          .filter((p) => p.group === 'Humanities')
          .reduce((sum, p) => sum + p.amount, 0),
      };

      // Gender breakdown
      const byGender = {
        Male: alumniStudents.filter((p) => p.gender === 'Male').length,
        Female: alumniStudents.filter((p) => p.gender === 'Female').length,
      };

      // Blood group breakdown
      const byBloodGroup = {
        "Don't know": alumniStudents.filter(
          (p) => p.bloodGroup === "Don't know",
        ).length,
        'A+': alumniStudents.filter((p) => p.bloodGroup === 'A+').length,
        'B+': alumniStudents.filter((p) => p.bloodGroup === 'B+').length,
        'O+': alumniStudents.filter((p) => p.bloodGroup === 'O+').length,
        'AB+': alumniStudents.filter((p) => p.bloodGroup === 'AB+').length,
        'AB-': alumniStudents.filter((p) => p.bloodGroup === 'AB-').length,
        'A-': alumniStudents.filter((p) => p.bloodGroup === 'A-').length,
        'B-': alumniStudents.filter((p) => p.bloodGroup === 'B-').length,
        'O-': alumniStudents.filter((p) => p.bloodGroup === 'O-').length,
      };

      // Email statistics
      const emailStats = {
        totalSent: allParticipants.filter((p) => p.isEmailSent).length,
        totalNotSent: allParticipants.filter((p) => !p.isEmailSent).length,
        totalEmailDetails: allParticipants.reduce(
          (sum, p) => sum + (p.emailSendingDetails?.length || 0),
          0,
        ),
      };

      // Guest and baby statistics
      const guestBabyStats = {
        guestsWithMainParticipant: allParticipants.filter(
          (p) => p.participantCategory === 'Guest' && p.mainParticipantId,
        ).length,
        babiesWithMainParticipant: allParticipants.filter(
          (p) => p.participantCategory === 'Baby' && p.mainParticipantId,
        ).length,
      };

      // Registration trends by date
      const registrationsByDate = {};
      allParticipants.forEach((p) => {
        const date = new Date(p.createdAt).toISOString().split('T')[0];
        registrationsByDate[date] = (registrationsByDate[date] || 0) + 1;
      });

      // Top batches by participation count
      const batchCounts: Record<number, number> = {};
      alumniStudents.forEach((p) => {
        const batch = p.hscPassingYear;
        if (batch) {
          batchCounts[batch] = (batchCounts[batch] || 0) + 1;
        }
      });

      const allBatches = Object.entries(batchCounts)
        .map(([batch, count]: [string, number]) => ({
          batch: parseInt(batch),
          count,
        }))
        .sort((a, b) => b.count - a.count);

      const topBatches = allBatches.slice(0, 10);

      // Average amount per category
      const averageAmountByCategory = {
        Alumni:
          byCategory.Alumni > 0
            ? revenueByCategory.Alumni / byCategory.Alumni
            : 0,
        Student:
          byCategory.Student > 0
            ? revenueByCategory.Student / byCategory.Student
            : 0,
        Guest:
          byCategory.Guest > 0 ? revenueByCategory.Guest / byCategory.Guest : 0,
        Baby:
          byCategory.Baby > 0 ? revenueByCategory.Baby / byCategory.Baby : 0,
        LifetimeMembership:
          byCategory.LifetimeMembership > 0
            ? revenueByCategory.LifetimeMembership /
              byCategory.LifetimeMembership
            : 0,
      };

      // Hourly registration distribution
      const hourlyDistribution = {};
      for (let i = 0; i < 24; i++) {
        hourlyDistribution[i] = 0;
      }
      allParticipants.forEach((p) => {
        const hour = new Date(p.createdAt).getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      });

      // Payment status statistics
      // Not paid: only those explicitly marked as 'Not Paid'
      const notPaidParticipants = allParticipants.filter(
        (p) => p.submittedFrom === 'Not Paid',
      );
      // Paid: all others (including null, undefined, 'Paid', or any other value)
      const paidParticipants = allParticipants.filter(
        (p) => p.submittedFrom !== 'Not Paid',
      );

      // Paid participants total count
      const paidParticipantsTotalCount = paidParticipants.length;

      // Not paid participants total count
      const notPaidParticipantsTotalCount = notPaidParticipants.length;

      // Paid participants by category
      const paidAlumni = paidParticipants.filter(
        (p) => p.participantCategory === 'Alumni',
      );
      const paidStudent = paidParticipants.filter(
        (p) => p.participantCategory === 'Student',
      );
      const paidLifetimeMembership = paidParticipants.filter(
        (p) => p.participantCategory === 'Lifetime Membership',
      );
      const paidGuest = paidParticipants.filter(
        (p) => p.participantCategory === 'Guest',
      );
      const paidBaby = paidParticipants.filter(
        (p) => p.participantCategory === 'Baby',
      );

      // Not paid participants by category
      const notPaidAlumni = notPaidParticipants.filter(
        (p) => p.participantCategory === 'Alumni',
      );
      const notPaidStudent = notPaidParticipants.filter(
        (p) => p.participantCategory === 'Student',
      );
      const notPaidLifetimeMembership = notPaidParticipants.filter(
        (p) => p.participantCategory === 'Lifetime Membership',
      );
      const notPaidGuest = notPaidParticipants.filter(
        (p) => p.participantCategory === 'Guest',
      );
      const notPaidBaby = notPaidParticipants.filter(
        (p) => p.participantCategory === 'Baby',
      );

      return {
        overview: {
          totalParticipants,
          totalRevenue,
          averageAmountPerParticipant:
            totalParticipants > 0 ? totalRevenue / totalParticipants : 0,
        },
        byCategory: {
          counts: byCategory,
          revenue: revenueByCategory,
          averages: averageAmountByCategory,
        },
        byAmountType: {
          counts: byAmountType,
          revenue: revenueByAmountType,
        },
        byPaymentMethod: {
          counts: byPaymentMethod,
          revenue: revenueByPaymentMethod,
        },
        demographics: {
          byGroup: {
            counts: byGroup,
            revenue: revenueByGroup,
          },
          byGender: byGender,
          byBloodGroup: byBloodGroup,
        },
        emailStatistics: emailStats,
        guestBabyStatistics: guestBabyStats,
        registrationTrends: {
          byDate: registrationsByDate,
          hourlyDistribution: hourlyDistribution,
        },
        topBatches,
        allBatches,
        paymentStatus: {
          paidParticipantsTotalCount: paidParticipantsTotalCount,
          notPaidParticipantsTotalCount: notPaidParticipantsTotalCount,
          paidAlumni: {
            count: paidAlumni.length,
            amount: paidAlumni.reduce((sum, p) => sum + p.amount, 0),
          },
          notPaidAlumni: {
            count: notPaidAlumni.length,
            amount: notPaidAlumni.reduce((sum, p) => sum + p.amount, 0),
          },
          paidStudent: {
            count: paidStudent.length,
            amount: paidStudent.reduce((sum, p) => sum + p.amount, 0),
          },
          notPaidStudent: {
            count: notPaidStudent.length,
            amount: notPaidStudent.reduce((sum, p) => sum + p.amount, 0),
          },
          paidLifetimeMembership: {
            count: paidLifetimeMembership.length,
            amount: paidLifetimeMembership.reduce(
              (sum, p) => sum + p.amount,
              0,
            ),
          },
          notPaidLifetimeMembership: {
            count: notPaidLifetimeMembership.length,
            amount: notPaidLifetimeMembership.reduce(
              (sum, p) => sum + p.amount,
              0,
            ),
          },
          paidGuest: {
            count: paidGuest.length,
            amount: paidGuest.reduce((sum, p) => sum + p.amount, 0),
          },
          notPaidGuest: {
            count: notPaidGuest.length,
            amount: notPaidGuest.reduce((sum, p) => sum + p.amount, 0),
          },
          paidBaby: {
            count: paidBaby.length,
            amount: paidBaby.reduce((sum, p) => sum + p.amount, 0),
          },
          notPaidBaby: {
            count: notPaidBaby.length,
            amount: notPaidBaby.reduce((sum, p) => sum + p.amount, 0),
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch statistics: ${error.message}`,
      );
    }
  }
}
