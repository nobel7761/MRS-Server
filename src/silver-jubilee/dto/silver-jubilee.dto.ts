import {
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Min,
  MaxLength,
  MinLength,
  ValidateIf,
  IsBoolean,
  IsObject,
  IsArray,
  IsDate,
  IsDateString,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SilverJubileeParticipantCategory,
  SilverJubileeGroup,
  SilverJubileeGender,
  SilverJubileeBloodGroup,
  SilverJubileePaymentType,
  SilverJubileeAmountType,
  SilverJubileeGuestAmountType,
} from '../enums/silver-jubilee.enum';

// Create Participant DTO
export class CreateSilverJubileeParticipantDto {
  @IsEnum(SilverJubileeParticipantCategory)
  @IsNotEmpty()
  participantCategory: SilverJubileeParticipantCategory;

  // Personal Information (optional for guests, required for others)
  @ValidateIf((o) => o.fullName !== '' && o.fullName !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @ValidateIf((o) => o.phoneNumber !== '' && o.phoneNumber !== null)
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  phoneNumber?: string;

  @ValidateIf(
    (o) => o.alternativePhoneNumber !== '' && o.alternativePhoneNumber !== null,
  )
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  alternativePhoneNumber?: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateIf((o) => o.hscPassingYear !== '' && o.hscPassingYear !== null)
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1990)
  hscPassingYear?: number;

  @ValidateIf((o) => o.group !== '' && o.group !== null)
  @IsEnum(SilverJubileeGroup)
  @IsOptional()
  group?: SilverJubileeGroup;

  @ValidateIf((o) => o.gender !== '' && o.gender !== null)
  @IsEnum(SilverJubileeGender)
  @IsOptional()
  gender?: SilverJubileeGender;

  @ValidateIf((o) => o.bloodGroup !== '' && o.bloodGroup !== null)
  @IsEnum(SilverJubileeBloodGroup)
  @IsOptional()
  bloodGroup?: SilverJubileeBloodGroup;

  @IsEnum(SilverJubileePaymentType)
  @IsNotEmpty()
  paymentType: SilverJubileePaymentType;

  @ValidateIf((o) => o.amountType !== '' && o.amountType !== null)
  @IsEnum(SilverJubileeAmountType)
  @IsOptional()
  amountType?: SilverJubileeAmountType;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ValidateIf((o) => o.comments !== '' && o.comments !== null)
  @IsString()
  @IsOptional()
  @MaxLength(500)
  comments?: string;

  @ValidateIf(
    (o) => o.professionalDetails !== '' && o.professionalDetails !== null,
  )
  @IsString()
  @IsOptional()
  @MaxLength(150)
  professionalDetails?: string;

  // Parents Information (optional for guests, required for others)
  @ValidateIf((o) => o.fatherName !== '' && o.fatherName !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fatherName?: string;

  @ValidateIf((o) => o.fatherPhoneNumber !== '' && o.fatherPhoneNumber !== null)
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  fatherPhoneNumber?: string;

  @ValidateIf((o) => o.fatherOccupation !== '' && o.fatherOccupation !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fatherOccupation?: string;

  @ValidateIf((o) => o.motherName !== '' && o.motherName !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  motherName?: string;

  @ValidateIf((o) => o.motherPhoneNumber !== '' && o.motherPhoneNumber !== null)
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  motherPhoneNumber?: string;

  @ValidateIf((o) => o.motherOccupation !== '' && o.motherOccupation !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  motherOccupation?: string;

  @ValidateIf((o) => o.submittedFrom !== '' && o.submittedFrom !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  submittedFrom?: string;

  // Guest Information (optional, only for guests)
  @ValidateIf(
    (o) => o.mainParticipantBatch !== '' && o.mainParticipantBatch !== null,
  )
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  mainParticipantBatch?: number;

  @ValidateIf(
    (o) => o.mainParticipantGroup !== '' && o.mainParticipantGroup !== null,
  )
  @IsEnum(SilverJubileeGroup)
  @IsOptional()
  mainParticipantGroup?: SilverJubileeGroup;

  @ValidateIf((o) => o.mainParticipantId !== '' && o.mainParticipantId !== null)
  @IsString()
  @IsOptional()
  mainParticipantId?: string;

  @ValidateIf(
    (o) => o.mainParticipantName !== '' && o.mainParticipantName !== null,
  )
  @IsString()
  @IsOptional()
  @MaxLength(100)
  mainParticipantName?: string;

  @ValidateIf((o) => o.guestName !== '' && o.guestName !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  guestName?: string;

  @ValidateIf((o) => o.guestMobileNumber !== '' && o.guestMobileNumber !== null)
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  guestMobileNumber?: string;

  // Baby Information (optional, only for babies)
  @ValidateIf((o) => o.babyName !== '' && o.babyName !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  babyName?: string;

  @ValidateIf((o) => o.babyPhone !== '' && o.babyPhone !== null)
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  babyPhone?: string;

  // New fields for tracking registration details
  @ValidateIf((o) => o.registeredUnder !== '' && o.registeredUnder !== null)
  @IsString()
  @IsOptional()
  registeredUnder?: string;

  @ValidateIf((o) => o.formFilledUpBy !== '' && o.formFilledUpBy !== null)
  @IsString()
  @IsOptional()
  formFilledUpBy?: string;
}

// Update Participant DTO
export class UpdateSilverJubileeParticipantDto {
  @IsEnum(SilverJubileeParticipantCategory)
  @IsOptional()
  participantCategory?: SilverJubileeParticipantCategory;

  // Personal Information (optional for guests, required for others)
  @ValidateIf((o) => o.fullName !== '' && o.fullName !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @ValidateIf((o) => o.phoneNumber !== '' && o.phoneNumber !== null)
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  phoneNumber?: string;

  @ValidateIf(
    (o) => o.alternativePhoneNumber !== '' && o.alternativePhoneNumber !== null,
  )
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  alternativePhoneNumber?: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateIf((o) => o.hscPassingYear !== '' && o.hscPassingYear !== null)
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1990)
  hscPassingYear?: number;

  @ValidateIf((o) => o.group !== '' && o.group !== null)
  @IsEnum(SilverJubileeGroup)
  @IsOptional()
  group?: SilverJubileeGroup;

  @ValidateIf((o) => o.gender !== '' && o.gender !== null)
  @IsEnum(SilverJubileeGender)
  @IsOptional()
  gender?: SilverJubileeGender;

  @ValidateIf((o) => o.bloodGroup !== '' && o.bloodGroup !== null)
  @IsEnum(SilverJubileeBloodGroup)
  @IsOptional()
  bloodGroup?: SilverJubileeBloodGroup;

  @IsEnum(SilverJubileePaymentType)
  @IsOptional()
  paymentType?: SilverJubileePaymentType;

  @ValidateIf((o) => o.amountType !== '' && o.amountType !== null)
  @IsEnum(SilverJubileeAmountType)
  @IsOptional()
  amountType?: SilverJubileeAmountType;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @ValidateIf((o) => o.comments !== '' && o.comments !== null)
  @IsString()
  @IsOptional()
  @MaxLength(500)
  comments?: string;

  @ValidateIf(
    (o) => o.professionalDetails !== '' && o.professionalDetails !== null,
  )
  @IsString()
  @IsOptional()
  @MaxLength(150)
  professionalDetails?: string;

  // Parents Information (optional for guests, required for others)
  @ValidateIf((o) => o.fatherName !== '' && o.fatherName !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fatherName?: string;

  @ValidateIf((o) => o.fatherPhoneNumber !== '' && o.fatherPhoneNumber !== null)
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  fatherPhoneNumber?: string;

  @ValidateIf((o) => o.fatherOccupation !== '' && o.fatherOccupation !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fatherOccupation?: string;

  @ValidateIf((o) => o.motherName !== '' && o.motherName !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  motherName?: string;

  @ValidateIf((o) => o.motherPhoneNumber !== '' && o.motherPhoneNumber !== null)
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  motherPhoneNumber?: string;

  @ValidateIf((o) => o.motherOccupation !== '' && o.motherOccupation !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  motherOccupation?: string;

  @ValidateIf((o) => o.submittedFrom !== '' && o.submittedFrom !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  submittedFrom?: string;

  // Guest Information (optional, only for guests)
  @ValidateIf(
    (o) => o.mainParticipantBatch !== '' && o.mainParticipantBatch !== null,
  )
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  mainParticipantBatch?: number;

  @ValidateIf(
    (o) => o.mainParticipantGroup !== '' && o.mainParticipantGroup !== null,
  )
  @IsEnum(SilverJubileeGroup)
  @IsOptional()
  mainParticipantGroup?: SilverJubileeGroup;

  @ValidateIf((o) => o.mainParticipantId !== '' && o.mainParticipantId !== null)
  @IsString()
  @IsOptional()
  mainParticipantId?: string;

  @ValidateIf(
    (o) => o.mainParticipantName !== '' && o.mainParticipantName !== null,
  )
  @IsString()
  @IsOptional()
  @MaxLength(100)
  mainParticipantName?: string;

  @ValidateIf((o) => o.guestName !== '' && o.guestName !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  guestName?: string;

  @ValidateIf((o) => o.guestMobileNumber !== '' && o.guestMobileNumber !== null)
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  guestMobileNumber?: string;

  // Baby Information (optional, only for babies)
  @ValidateIf((o) => o.babyName !== '' && o.babyName !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  babyName?: string;

  @ValidateIf((o) => o.babyPhone !== '' && o.babyPhone !== null)
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  babyPhone?: string;

  // New fields for tracking registration details
  @ValidateIf((o) => o.registeredUnder !== '' && o.registeredUnder !== null)
  @IsString()
  @IsOptional()
  registeredUnder?: string;

  @ValidateIf((o) => o.formFilledUpBy !== '' && o.formFilledUpBy !== null)
  @IsString()
  @IsOptional()
  formFilledUpBy?: string;

  // Timestamp fields
  @IsDateString()
  @Type(() => Date)
  @IsOptional()
  createdAt?: Date;
}

// Query DTO for filtering and pagination
export class SilverJubileeQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SilverJubileeParticipantCategory)
  participantCategory?: SilverJubileeParticipantCategory;

  @IsOptional()
  @IsEnum(SilverJubileeGroup)
  group?: SilverJubileeGroup;

  @IsOptional()
  @IsNumber()
  hscPassingYear?: number;

  @IsOptional()
  @IsEnum(SilverJubileePaymentType)
  paymentType?: SilverJubileePaymentType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

// Email Sending Detail DTO
export class EmailMetadataDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cc?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bcc?: string[];
}

export class SentByDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  system?: boolean;
}

export class EmailSendingDetailDto {
  @IsString()
  @IsNotEmpty()
  emailType: string;

  @IsObject()
  @ValidateNested()
  @Type(() => EmailMetadataDto)
  emailMetadata: EmailMetadataDto;

  @IsString()
  @IsNotEmpty()
  emailContent: string;

  @IsDate()
  @Type(() => Date)
  sentAt: Date;

  @IsObject()
  @ValidateNested()
  @Type(() => SentByDto)
  sentBy: SentByDto;

  @IsEnum(['success', 'failed', 'pending'])
  @IsNotEmpty()
  status: 'success' | 'failed' | 'pending';

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Add Email Sending Detail DTO (for adding a new email record to a participant)
export class AddEmailSendingDetailDto {
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @ValidateNested()
  @Type(() => EmailSendingDetailDto)
  emailDetail: EmailSendingDetailDto;
}

// Response DTO
export class SilverJubileeParticipantResponseDto {
  _id: string;
  participantCategory: SilverJubileeParticipantCategory;
  secretCode: string;
  fullName?: string;
  phoneNumber?: string;
  alternativePhoneNumber?: string;
  email?: string;
  hscPassingYear?: number;
  group?: SilverJubileeGroup;
  gender?: SilverJubileeGender;
  bloodGroup?: SilverJubileeBloodGroup;
  paymentType: SilverJubileePaymentType;
  amountType?: SilverJubileeAmountType;
  amount: number;
  comments?: string;
  professionalDetails?: string;
  isEmailSent?: boolean;
  emailSendingDetails?: EmailSendingDetailDto[];
  registeredUnder?: string;
  formFilledUpBy?: string;
  fatherName?: string;
  fatherPhoneNumber?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhoneNumber?: string;
  motherOccupation?: string;
  submittedFrom?: string;
  mainParticipantBatch?: number;
  mainParticipantGroup?: SilverJubileeGroup;
  mainParticipantId?: string;
  mainParticipantName?: string;
  guestName?: string;
  guestMobileNumber?: string;
  babyName?: string;
  babyPhone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// List Response DTO
export class SilverJubileeParticipantListResponseDto {
  participants: SilverJubileeParticipantResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Batch and Group Query DTO
export class BatchGroupQueryDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @Min(2003)
  batch: number;

  @IsEnum(SilverJubileeGroup)
  @IsNotEmpty()
  group: SilverJubileeGroup;
}

// Batch and Group Response DTO
export class BatchGroupResponseDto {
  batch: number;
  group: string;
  total: number;
  participants: any[];
}

// Update Payment Status DTO
export class UpdatePaymentStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['Paid', 'Not Paid'], {
    message: "Status must be either 'Paid' or 'Not Paid'",
  })
  status: 'Paid' | 'Not Paid';
}
