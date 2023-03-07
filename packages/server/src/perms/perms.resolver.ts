import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class PermsResolver {
  @Query(() => String)
  hello() {
    return 'Hello world!';
  }
}
