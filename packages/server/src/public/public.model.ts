import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PublicBucket {
  @Prop()
  bucket: string;

  @Prop()
  project: string;
}

export type PublicBucketDocument = PublicBucket & Document;
export const PublicBucketSchema = SchemaFactory.createForClass(PublicBucket);
