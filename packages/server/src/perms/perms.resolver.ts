import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Permissions } from './perms.model';
import { PermService } from './perms.service';
import { BadRequestException } from '@nestjs/common';
import { PermissionChange } from './perms.dto';

@Resolver(() => Permissions)
export class PermsResolver {
  constructor(private readonly permsService: PermService) {}

  @Mutation(() => [Permissions])
  addUser(@Args('user') user: string, @Args('project') project: string) {
    // TODO: Verify the user and project exist
    return this.permsService.addUser(user, project);
  }

  @Query(() => [Permissions], { description: "Get all permissions for the user based on the user's project" })
  getPermissions(@Args('user') user: string): Promise<Permissions[]> {
    return this.permsService.getPermissions(user);
  }

  @Query(() => Permissions)
  async getPermissionsForBucket(@Args('user') user: string, @Args('bucket') bucket: string): Promise<Permissions> {
    const permissions = await this.permsService.getPermissionsForBucket(user, bucket);
    if (!permissions) {
      throw new BadRequestException(`User ${user} does not have permissions for bucket ${bucket}`);
    }
    return permissions;
  }

  @Mutation(() => Permissions)
  async changePermissions(
    @Args('change') change: PermissionChange,
    @Args('user') user: string,
    @Args('bucket') bucket: string
  ): Promise<Permissions> {
    const newPerms = await this.permsService.changePermissions(user, bucket, change);
    if (!newPerms) {
      throw new BadRequestException(`User ${user} does not have permissions for bucket ${bucket}`);
    }
    return newPerms;
  }
}
