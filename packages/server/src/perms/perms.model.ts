import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';


/** Definition for external user */
@ObjectType()
@Directive('@key(fields: "id")')
@Directive('@extends')
export class UserModel {
  @Field(() => ID)
  @Directive('@external')
  id: string;
}

@Schema()
@ObjectType()
@Directive('@key(fields: "_id")')
export class CargoPermissions {
  @Field(() => ID)
  _id: mongoose.Types.ObjectId;

  @Prop()
  @Field(() => UserModel, { description: 'ID of the user from the Auth microservice' })
  user: string;

  @Prop()
  @Field(() => String, { description: 'The bucket that the user permission is on' })
  bucket: string;

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

export type CargoPermissionsDocument = CargoPermissions & Document;
export const CargoPermissionsSchema = SchemaFactory.createForClass(CargoPermissions);
