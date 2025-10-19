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
  ValidateNested,
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
  @MaxLength(15)
  phoneNumber?: string;

  @ValidateIf(
    (o) => o.alternativePhoneNumber !== '' && o.alternativePhoneNumber !== null,
  )
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(15)
  alternativePhoneNumber?: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateIf((o) => o.hscPassingYear !== '' && o.hscPassingYear !== null)
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

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ValidateIf((o) => o.comments !== '' && o.comments !== null)
  @IsString()
  @IsOptional()
  @MaxLength(500)
  comments?: string;

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
  @MaxLength(15)
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
  @MaxLength(15)
  motherPhoneNumber?: string;

  @ValidateIf((o) => o.motherOccupation !== '' && o.motherOccupation !== null)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  motherOccupation?: string;

  // Guest Information (optional, only for guests)
  @ValidateIf(
    (o) => o.mainParticipantBatch !== '' && o.mainParticipantBatch !== null,
  )
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
  @MaxLength(15)
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
  @MaxLength(15)
  babyPhone?: string;
}

// Update Participant DTO
export class UpdateSilverJubileeParticipantDto {
  @IsEnum(SilverJubileeParticipantCategory)
  @IsOptional()
  participantCategory?: SilverJubileeParticipantCategory;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(15)
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(15)
  alternativePhoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  @Min(1990)
  hscPassingYear?: number;

  @IsEnum(SilverJubileeGroup)
  @IsOptional()
  group?: SilverJubileeGroup;

  @IsEnum(SilverJubileeGender)
  @IsOptional()
  gender?: SilverJubileeGender;

  @IsEnum(SilverJubileeBloodGroup)
  @IsOptional()
  bloodGroup?: SilverJubileeBloodGroup;

  @IsEnum(SilverJubileePaymentType)
  @IsOptional()
  paymentType?: SilverJubileePaymentType;

  @IsEnum(SilverJubileeAmountType)
  @IsOptional()
  amountType?: SilverJubileeAmountType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  comments?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  fatherName?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(15)
  fatherPhoneNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  fatherOccupation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  motherName?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(15)
  motherPhoneNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  motherOccupation?: string;

  @IsNumber()
  @IsOptional()
  mainParticipantBatch?: number;

  @IsEnum(SilverJubileeGroup)
  @IsOptional()
  mainParticipantGroup?: SilverJubileeGroup;

  @IsString()
  @IsOptional()
  mainParticipantId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  mainParticipantName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  guestName?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(15)
  guestMobileNumber?: string;
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
  isEmailSent?: boolean;
  emailSendingDetails?: EmailSendingDetailDto[];
  registeredBy?: string;
  fatherName?: string;
  fatherPhoneNumber?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhoneNumber?: string;
  motherOccupation?: string;
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
