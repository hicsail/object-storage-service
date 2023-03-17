import { UseGuards, BadRequestException } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, ResolveReference } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ServiceAccountGuard } from '../auth/service-account.guard';
import { Project } from './project.model';
import { ProjectService } from './project.service';
import mongoose from 'mongoose';

@UseGuards(JwtAuthGuard, ServiceAccountGuard)
@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Mutation(() => Project, { description: 'Add a bucket to a project, if the project is new it will be created' })
  addBucketToProject(@Args('project') project: string, @Args('bucket') bucket: string) {
    // TODO: Make sure it is the correct service account
    return this.projectService.addBucket(project, bucket);
  }

  @Query(() => [String])
  getBucketsForProject(@Args('project') project: string) {
    // TODO: Make sure it is the correct service account
    return this.projectService.getBuckets(project);
  }

  @ResolveReference()
  async resolveReference(reference: { __typename: string; _id: string }): Promise<Project> {
    try {
      const result = await this.projectService.find(new mongoose.Types.ObjectId(reference._id));
      if (result) {
        return result;
      }
    } catch (e: any) {}

    throw new BadRequestException(`Organization not found with id: ${reference._id}`);
  }
}
