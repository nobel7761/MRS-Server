import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

export interface PricingRange {
  batchRange: string;
  fee: number;
  description: string;
  isPopular?: boolean;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  shortDescription: string;

  @Prop({ required: true, trim: true })
  fullDescription: string;

  @Prop({ required: true })
  bannerImage: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startsTime: string;

  @Prop({ required: true, trim: true })
  venue: string;

  @Prop({ trim: true })
  googleMapLink?: string;

  @Prop({ required: true, trim: true })
  organizerName: string;

  @Prop({ required: true, trim: true })
  organizerContactInfo: string;

  @Prop({ type: [String], default: [] })
  specialGuests: string[];

  @Prop({ required: true, default: false })
  isPaidEvent: boolean;

  @Prop({
    type: [
      {
        batchRange: { type: String, required: true },
        fee: { type: Number, required: true },
        description: { type: String, required: true },
        isPopular: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  pricingRanges: PricingRange[];

  @Prop({ required: true, min: 1 })
  seatLimit: number;

  @Prop({
    type: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      website: { type: String },
    },
    default: {},
  })
  socialMediaLinks: SocialMediaLinks;

  @Prop({
    required: true,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming',
  })
  status: string;

  @Prop({
    required: true,
    enum: ['Public', 'Private', 'Alumni-only'],
    default: 'Public',
  })
  visibility: string;

  @Prop({ default: 0 })
  registeredCount: number;

  @Prop({ type: [String], default: [] })
  registeredUsers: string[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
