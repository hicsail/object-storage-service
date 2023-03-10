import { Resolver, Query, Args } from '@nestjs/graphql';
import { SignService } from './sign.service';
import { SignedReqeuest } from './sign.model';
import { ResourceRequest } from './request.dto';

@Resolver(() => SignedReqeuest)
export class SignResolver {
  constructor(private readonly signService: SignService) {}

  @Query(() => SignedReqeuest)
  signRequest(@Args('request') request: ResourceRequest): Promise<SignedReqeuest> {
    return this.signService.signRequest(request);
  }
}
