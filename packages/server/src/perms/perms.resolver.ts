import { UseGuards } from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Permissions } from './perms.model';
import { UserContext } from '../auth/user.decorator';
import { User } from '../auth/user.dto';

@Resolver(() => Permissions)
export class PermsResolver {
  @Query(() => String)
  hello() {
    return 'Hello world!';
  }

  @Query(() => Permissions)
  @UseGuards(JwtAuthGuard)
  getPermissions(@UserContext() user: User) {

  }
}
