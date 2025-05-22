import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RepresentativeCollectionDocument = RepresentativeCollection &
  Document;

@Schema({ timestamps: true })
export class RepresentativeCollection {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  facebookUrl: string;

  @Prop()
  comments: string;

  @Prop({ required: true })
  hscYear: number;

  @Prop({ required: true })
  hscGroup: string;

  @Prop({ required: true })
  gender: string;
}

export const RepresentativeCollectionSchema = SchemaFactory.createForClass(
  RepresentativeCollection,
);
