import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  SilverJubileeParticipantCategory,
  SilverJubileeGroup,
  SilverJubileeGender,
  SilverJubileeBloodGroup,
  SilverJubileePaymentType,
  SilverJubileeAmountType,
} from '../enums/silver-jubilee.enum';

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

  // Parents Information (optional for guests, required for others)
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
