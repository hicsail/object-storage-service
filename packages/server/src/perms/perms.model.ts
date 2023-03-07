import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Schema()
@ObjectType()
export class Permissions {
  @Field(() => ID)
  _id: mongoose.Types.ObjectId;

  @Prop()
  @Field(() => ID, { description: 'ID of the user from the Auth microservice' })
  user: string;

  @Prop()
  @Field(() => ID, { description: 'Project ID of the user from the Auth microservice' })
  project: string;

  @Prop()
  @Field({ description: 'If the user has read access to the bucket' })
  read: boolean;

  @Prop()
  @Field({ description: 'If the user has write access to the bucket' })
  write: boolean;

  @Prop()
  @Field({ description: 'If the user can delete objects in the bucket' })
  delete: boolean;

  @Prop()
  @Field({ description: 'If the user can modify permissions on the bucket' })
  admin: boolean;
}

export type PermissionsDocument = Permissions & Document;
export const PermissionsSchema = SchemaFactory.createForClass(Permissions);
