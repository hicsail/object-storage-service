import { Resolver, Query, Mutation, Args, ResolveReference } from '@nestjs/graphql';
import { Permissions } from './perms.model';
import { PermService } from './perms.service';
import { BadRequestException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { PermissionChange } from './perms.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserContext } from '../auth/user.decorator';
import { TokenPayload } from '../auth/user.dto';
import { ServiceAccountGuard } from '../auth/service-account.guard';
import { ProjectService } from '../project/project.service';
import mongoose from 'mongoose';

/**
 * Handles all requests made by non-service accounts.
 */
@UseGuards(JwtAuthGuard)
@Resolver(() => Permissions)
export class PermsResolver {
  constructor(private readonly permsService: PermService) {}

  @Query(() => [Permissions], { description: 'Get all permissions for the user of the JWT for their project' })
  getPermissions(@UserContext() user: TokenPayload): Promise<Permissions[]> {
    return this.permsService.getPermissions(user.id);
  }

  @Query(() => Permissions, {
    description: 'Allows the currently authenticated user to get their own permisisons for a bucket'
  })
  async getPermissionsForBucket(
    @UserContext() user: TokenPayload,
    @Args('bucket') bucket: string
  ): Promise<Permissions> {
    const permissions = await this.permsService.getPermissionsForBucket(user.id, bucket);
    if (!permissions) {
      throw new BadRequestException(`User ${user} does not have permissions for bucket ${bucket}`);
    }
    return permissions;
  }

  @Query(() => [Permissions], { description: 'Means for the admin to get all permissions for a given bucket' })
  async getAllBucketPermissions(
    @Args('bucket') bucket: string,
    @UserContext() user: TokenPayload
  ): Promise<Permissions[]> {
    const permissions = await this.permsService.getPermissionsForBucket(user.id, bucket);
    if (!permissions || !permissions.admin) {
      throw new UnauthorizedException(`User ${user.id} does not have permissions for bucket ${bucket}`);
    }
    return this.permsService.getAllBucketPermissions(bucket);
  }

  @Mutation(() => Permissions)
  async changePermissions(
    @Args('change') change: PermissionChange,
    @Args('user') user: string,
    @Args('bucket') bucket: string,
    @UserContext() requestingUser: TokenPayload
  ): Promise<Permissions> {
    // Determine if the user making the request can change permissions on this bucket
    const requestersPermissions = await this.permsService.getPermissionsForBucket(requestingUser.id, bucket);
    if (!requestersPermissions || !requestersPermissions.admin) {
      throw new UnauthorizedException(`User ${requestingUser.id} does not have permissions for bucket ${bucket}`);
    }

    // Change the permissions
    const newPerms = await this.permsService.changePermissions(user, bucket, change);
    if (!newPerms) {
      throw new BadRequestException(`User ${user} does not have permissions for bucket ${bucket}`);
    }
    return newPerms;
  }

  @ResolveReference()
  async resolveReference(reference: { __typename: string; _id: string }): Promise<Permissions> {
    try {
      const result = await this.permsService.find(new mongoose.Types.ObjectId(reference._id));
      if (result) {
        return result;
      }
    } catch (e: any) {}

    throw new BadRequestException(`Organization not found with id: ${reference._id}`);
  }
}

/**
 * Handles requests that only the service account can make. This is to make
 * it easier to support both the service account and regular user requests
 */
@UseGuards(JwtAuthGuard, ServiceAccountGuard)
export class ServiceAccountPermsResolver {
  constructor(private readonly permsService: PermService, private readonly projectService: ProjectService) {}

  @Mutation(() => [Permissions])
  serviceAddUser(
    @Args('user') user: string,
    @Args('project') project: string,
    @UserContext() serviceAccount: TokenPayload
  ) {
    // Make sure it is the correct service account
    if (serviceAccount.projectId !== project) {
      throw new UnauthorizedException('Service account must be in the same project as the user');
    }

    return this.permsService.addUser(user, project);
  }

  @Mutation(() => Permissions)
  async serviceChangePermissions(
    @Args('change') change: PermissionChange,
    @Args('user') user: string,
    @Args('bucket') bucket: string,
    @UserContext() serviceAccount: TokenPayload
  ): Promise<Permissions> {
    // Check to see if permissions are currently stored for the user
    const currentPermissions = await this.permsService.getPermissionsForBucket(user, bucket);
    if (!currentPermissions) {
      throw new BadRequestException(`User ${user} does not have permissions for bucket ${bucket}`);
    }

    // Determine which project the user is in
    const project = await this.projectService.getProjectForBucket(bucket);
    if (!project) {
      throw new BadRequestException(`Bucket ${bucket} does not exist`);
    }

    // Make sure the service account is in the same project as the user
    if (project != serviceAccount.projectId) {
      throw new UnauthorizedException('Service account must be in the same project as the user');
    }

    // Change the permissions
    const newPerms = await this.permsService.changePermissions(user, bucket, change);
    if (!newPerms) {
      throw new BadRequestException(`User ${user} does not have permissions for bucket ${bucket}`);
    }
    return newPerms;
  }
}
