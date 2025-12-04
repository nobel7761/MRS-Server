import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SouvenirDocument = Souvenir &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true })
export class Souvenir {
  @Prop({ required: true, trim: true })
  category: string; // e.g., "memory-writeup"

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  batch: string; // e.g., "2015"

  @Prop({ required: true, trim: true })
  group: string; // e.g., "science"

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop()
  photoUrl?: string; // Cloudinary URL (for non-photo-gallery categories)

  @Prop({ type: [String], default: [] })
  photoUrls?: string[]; // Array of Cloudinary URLs (for photo-gallery category)

  @Prop({ type: String })
  content?: string; // HTML content from rich text editor (optional for photo-gallery)

  @Prop({ trim: true })
  professionalDetails?: string;
}

export const SouvenirSchema = SchemaFactory.createForClass(Souvenir);
