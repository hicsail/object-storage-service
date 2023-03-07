import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Schema()
@ObjectType({ description: 'Keeps track of the buckets that belong to a project' })
export class Project {
  @Field(() => ID)
  _id: mongoose.Types.ObjectId;

  @Prop()
  @Field(() => ID, { description: 'Auth microservice project ID' })
  project: string;

  @Prop(() => [String])
  @Field(() => [String], { description: 'List of buckets that belong to the project' })
  buckets: string[];
}

export type ProjectDocument = Project & Document;
export const ProjectSchema = SchemaFactory.createForClass(Project);
