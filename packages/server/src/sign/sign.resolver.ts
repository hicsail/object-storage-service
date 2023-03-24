import { Resolver, Query, Args } from '@nestjs/graphql';
import { SignService } from './sign.service';
import { CargoSignedReqeuest } from './sign.model';
import { CargoResourceRequest } from './request.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserContext } from '../auth/user.decorator';
import { TokenPayload } from '../auth/user.dto';

@Resolver(() => CargoSignedReqeuest)
export class SignResolver {
  constructor(private readonly signService: SignService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => CargoSignedReqeuest)
  cargoSignRequest(@UserContext() user: TokenPayload, @Args('request') request: CargoResourceRequest): Promise<CargoSignedReqeuest> {
    return this.signService.signRequest(user, request);
  }
}
