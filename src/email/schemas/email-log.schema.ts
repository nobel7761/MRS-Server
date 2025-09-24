import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LogType {
  SENT = 'sent',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class EmailLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'EmailCampaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true })
  recipientEmail: string;

  @Prop()
  recipientName?: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  templateName: string;

  @Prop({ type: String, enum: LogType, required: true })
  type: LogType;

  @Prop()
  sentAt?: Date;

  @Prop()
  scheduledFor?: Date;

  @Prop()
  errorMessage?: string;

  @Prop()
  retryCount: number;

  @Prop()
  nextRetryAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);
