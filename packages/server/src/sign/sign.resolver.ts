import { Resolver, Query, Args } from '@nestjs/graphql';
import { SignService } from './sign.service';
import { SignedReqeuest } from './sign.model';
import { ResourceRequest } from './request.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserContext } from '../auth/user.decorator';
import { TokenPayload } from '../auth/user.dto';

@Resolver(() => SignedReqeuest)
export class SignResolver {
  constructor(private readonly signService: SignService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => SignedReqeuest)
  signRequest(@UserContext() user: TokenPayload, @Args('request') request: ResourceRequest): Promise<SignedReqeuest> {
    return this.signService.signRequest(user, request);
  }
}
