import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Permissions } from './perms.model';
import { UserContext } from '../auth/user.decorator';
import { User } from '../auth/user.dto';
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
  @UseGuards(JwtAuthGuard)
  getPermissions(@UserContext() user: User): Promise<Permissions[]> {
    return this.permsService.getPermissions(user);
  }
}
