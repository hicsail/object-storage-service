import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ServiceAccountGuard } from '../auth/service-account.guard';
import { UserContext } from '../auth/user.decorator';
import { TokenPayload } from '../auth/user.dto';
import { PublicService } from './public.service';

@Resolver()
@UseGuards(JwtAuthGuard, ServiceAccountGuard)
export class PublicResolver {
  constructor(private readonly publicService: PublicService) {}

  @Mutation(() => Boolean)
  async cargoMarkBucketPublic(
    @Args('bucket') bucket: string,
    @Args('markPublic') markPublic: boolean,
    @UserContext() serviceAccount: TokenPayload
  ): Promise<boolean> {
    await this.publicService.changePublic(markPublic, bucket, serviceAccount.projectId);
    return true;
  }
}
