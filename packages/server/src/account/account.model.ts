import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { S3Client } from '@aws-sdk/client-s3';

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

  @Prop()
  s3Region: string;

  getS3Client(): S3Client {
    return new S3Client({
      region: this.s3Region,
      forcePathStyle: true,
      endpoint: this.s3Endpoint,
      credentials: {
        accessKeyId: this.accessKey,
        secretAccessKey: this.accessSecret
      }
    });
  }
}

export type CargoAccountDocument = CargoAccount & Document;
export const CargoAccountSchema = SchemaFactory.createForClass(CargoAccount);
