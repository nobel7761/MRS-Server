import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FaqsCategory } from '../../faqs-category/schemas/faqs-category.schema';

export type FaqsDocument = Faqs & Document;

@Schema({ timestamps: true })
export class Faqs {
  @Prop({ type: Types.ObjectId, ref: 'FaqsCategory', required: true })
  categoryId: FaqsCategory;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: false })
  showHomePage: boolean;
}

export const FaqsSchema = SchemaFactory.createForClass(Faqs);
