import { Resolver, Query, Mutation, Args, ResolveReference } from '@nestjs/graphql';
import { CargoPermissions } from './perms.model';
import { PermService } from './perms.service';
import { BadRequestException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CargoPermissionChange } from './perms.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserContext } from '../auth/user.decorator';
import { TokenPayload } from '../auth/user.dto';
import { ServiceAccountGuard } from '../auth/service-account.guard';
import mongoose from 'mongoose';

/**
 * Handles all requests made by non-service accounts.
 */
@UseGuards(JwtAuthGuard)
@Resolver(() => CargoPermissions)
export class PermsResolver {
  constructor(private readonly permsService: PermService) {}

  @Query(() => [CargoPermissions], { description: 'Get all permissions for the user of the JWT for their project' })
  cargoGetCargoPermissions(@UserContext() user: TokenPayload): Promise<CargoPermissions[]> {
    return this.permsService.getPermissions(user);
  }

  @Query(() => CargoPermissions, {
    description: 'Allows the currently authenticated user to get their own permisisons for a bucket'
  })
  async cargoGetCargoPermissionsForBucket(
    @UserContext() user: TokenPayload,
    @Args('bucket') bucket: string
  ): Promise<CargoPermissions> {
    const permissions = await this.permsService.getPermissionsForBucket(user, bucket);
    if (!permissions) {
      throw new BadRequestException(`User ${user} does not have permissions for bucket ${bucket}`);
    }
    return permissions;
  }

  @Query(() => [CargoPermissions], { description: 'Means for the admin to get all permissions for a given bucket' })
  async cargoGetAllBucketCargoPermissions(
    @Args('bucket') bucket: string,
    @UserContext() user: TokenPayload
  ): Promise<CargoPermissions[]> {
    const permissions = await this.permsService.getPermissionsForBucket(user, bucket);
    if (!permissions || !permissions.admin) {
      throw new UnauthorizedException(`User ${user.id} does not have permissions for bucket ${bucket}`);
    }
    return this.permsService.getAllBucketPermissions(bucket);
  }

  @Mutation(() => CargoPermissions)
  async cargoChangeCargoPermissions(
    @Args('change') change: CargoPermissionChange,
    @Args('user') user: string,
    @Args('bucket') bucket: string,
    @UserContext() requestingUser: TokenPayload
  ): Promise<CargoPermissions> {
    // Determine if the user making the request can change permissions on this bucket
    const requestersCargoPermissions = await this.permsService.getPermissionsForBucket(requestingUser, bucket);
    if (!requestersCargoPermissions || !requestersCargoPermissions.admin) {
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
  async resolveReference(reference: { __typename: string; _id: string }): Promise<CargoPermissions> {
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
  constructor(private readonly permsService: PermService) {}

  @Mutation(() => [CargoPermissions])
  cargoServiceAddUser(
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

  @Mutation(() => CargoPermissions)
  async cargoServiceChangeCargoPermissions(
    @Args('change') change: CargoPermissionChange,
    @Args('user') user: string,
    @Args('bucket') bucket: string
  ): Promise<CargoPermissions> {
    // Change the permissions
    const newPerms = await this.permsService.changePermissions(user, bucket, change);
    if (!newPerms) {
      throw new BadRequestException(`User ${user} does not have permissions for bucket ${bucket}`);
    }
    return newPerms;
  }
}
