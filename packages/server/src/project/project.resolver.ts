import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ServiceAccountGuard } from '../auth/service-account.guard';
import { Project } from './project.model';
import { ProjectService } from './project.service';

@UseGuards(JwtAuthGuard, ServiceAccountGuard)
@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Mutation(() => Project, { description: 'Add a bucket to a project, if the project is new it will be created' })
  addBucketToProject(@Args('project') project: string, @Args('bucket') bucket: string) {
    return this.projectService.addBucket(project, bucket);
  }

  @Query(() => [String])
  getBucketsForProject(@Args('project') project: string) {
    return this.projectService.getBuckets(project);
  }
}
