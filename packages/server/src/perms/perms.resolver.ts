import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Permissions } from './perms.model';
import { PermService } from './perms.service';

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
}
