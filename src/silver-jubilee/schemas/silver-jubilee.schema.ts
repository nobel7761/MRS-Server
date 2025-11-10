import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  SilverJubileeParticipantCategory,
  SilverJubileeGroup,
  SilverJubileeGender,
  SilverJubileeBloodGroup,
  SilverJubileePaymentType,
  SilverJubileeAmountType,
} from '../enums/silver-jubilee.enum';

// Email Sending Details Schema
@Schema({ _id: false })
export class EmailSendingDetail {
  @Prop({ required: true })
  emailType: string; // e.g., 'registration', 'reminder', 'update', 'confirmation'

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  emailMetadata: {
    subject: string;
    to: string;
    from: string;
    cc?: string[];
    bcc?: string[];
  };

  @Prop({ required: true })
  emailContent: string; // Full HTML/text content of the email

  @Prop({ required: true, type: Date })
  sentAt: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  sentBy: {
    userId?: string;
    userName?: string;
    role?: string;
    system?: boolean; // true if sent automatically by system
  };

  @Prop({ required: true, enum: ['success', 'failed', 'pending'] })
  status: string;

  @Prop()
  error?: string; // Error message if sending failed

  @Prop()
  messageId?: string; // Email service provider's message ID

  @Prop()
  notes?: string; // Any additional notes
}

export const EmailSendingDetailSchema =
  SchemaFactory.createForClass(EmailSendingDetail);

export type SilverJubileeParticipantDocument = SilverJubileeParticipant &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true })
export class SilverJubileeParticipant {
  // Participant Category
  @Prop({
    required: true,
    enum: Object.values(SilverJubileeParticipantCategory),
  })
  participantCategory: string;

  @Prop({ required: true, unique: true, trim: true })
  secretCode: string;

  // Personal Information (optional for guests, required for others)
  @Prop({ trim: true })
  fullName?: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  @Prop({ trim: true })
  alternativePhoneNumber?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop()
  hscPassingYear?: number;

  @Prop({ enum: Object.values(SilverJubileeGroup) })
  group?: string;

  @Prop({ enum: Object.values(SilverJubileeGender) })
  gender?: string;

  @Prop({ enum: Object.values(SilverJubileeBloodGroup) })
  bloodGroup?: string;

  @Prop({ required: true, enum: Object.values(SilverJubileePaymentType) })
  paymentType: string;

  @Prop({
    required: true,
    enum: Object.values(SilverJubileeAmountType),
    default: SilverJubileeAmountType.REGISTRATION,
  })
  amountType: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ trim: true })
  comments?: string;

  @Prop({ trim: true })
  professionalDetails?: string;

  // Email tracking fields
  @Prop({ default: false })
  isEmailSent: boolean;

  @Prop({ type: [EmailSendingDetailSchema], default: [] })
  emailSendingDetails: EmailSendingDetail[];

  // Registration tracking
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  registeredUnder?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  formFilledUpBy?: string;

  // Parents Information (optional for guests, alumni, students, and lifetime membership; required for others)
  @Prop({ trim: true })
  fatherName?: string;

  @Prop({ trim: true })
  fatherPhoneNumber?: string;

  @Prop({ trim: true })
  fatherOccupation?: string;

  @Prop({ trim: true })
  motherName?: string;

  @Prop({ trim: true })
  motherPhoneNumber?: string;

  @Prop({ trim: true })
  motherOccupation?: string;

  @Prop({ trim: true })
  submittedFrom?: string;

  // Guest Information (only for guests)
  @Prop()
  mainParticipantBatch?: number;

  @Prop({ enum: Object.values(SilverJubileeGroup) })
  mainParticipantGroup?: string;

  @Prop()
  mainParticipantId?: string;

  @Prop({ trim: true })
  mainParticipantName?: string;

  @Prop({ trim: true })
  guestName?: string;

  @Prop({ trim: true })
  guestMobileNumber?: string;

  // Baby Information (only for babies)
  @Prop({ trim: true })
  babyName?: string;

  @Prop({ trim: true })
  babyPhone?: string;
}

export const SilverJubileeParticipantSchema = SchemaFactory.createForClass(
  SilverJubileeParticipant,
);
