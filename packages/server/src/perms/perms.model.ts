import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Schema()
@ObjectType()
export class Permissions {
  @Field(() => ID)
  _id: mongoose.Types.ObjectId;

  @Prop({ description: 'ID of the user from the Auth microservice' })
  @Field(() => ID)
  user: string;

  @Prop({ description: 'Project ID of the user from the Auth microservice' })
  @Field(() => ID)
  project: string;

  @Prop({ description: 'If the user has read access to the bucket' })
  @Field()
  read: boolean;

  @Prop({ description: 'If the user has write access to the bucket' })
  @Field()
  write: boolean;

  @Prop({ description: 'If the user can delete objects in the bucket' })
  @Field()
  delete: boolean;

  @Prop({ description: 'If the user can modify permissions on the bucket' })
  @Field()
  admin: boolean;
}

export type PermissionsDocument = Permissions & Document;
export const PermissionsSchema = SchemaFactory.createForClass(Permissions);
