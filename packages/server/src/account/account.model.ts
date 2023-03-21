import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CargoAccount {
  @Prop()
  accessKey: string;

  @Prop()
  accessSecret: string;

  @Prop()
  s3Endpoint: string;

  @Prop()
  project: string;
}

export type CargoAccountDocument = CargoAccount & Document;
export const CargoAccountSchema = SchemaFactory.createForClass(CargoAccount);
