import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FaqsCategoryDocument = FaqsCategory & Document;

@Schema({ timestamps: true })
export class FaqsCategory {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: 0 })
  order: number;
}

export const FaqsCategorySchema = SchemaFactory.createForClass(FaqsCategory);
