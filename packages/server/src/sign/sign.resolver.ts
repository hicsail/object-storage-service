import { Resolver, Query, Args } from '@nestjs/graphql';
import { SignService } from './sign.service';
import { CargoSignedRequest } from './sign.model';
import { CargoResourceRequest } from './request.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserContext } from '../auth/user.decorator';
import { TokenPayload } from '../auth/user.dto';
import { CargoPresignRequest } from './presign.dto';

@Resolver(() => CargoSignedRequest)
export class SignResolver {
  constructor(private readonly signService: SignService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => CargoSignedRequest)
  cargoSignRequest(
    @UserContext() user: TokenPayload,
    @Args('request') request: CargoResourceRequest
  ): Promise<CargoSignedRequest> {
    return this.signService.signRequest(user, request);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => String)
  async cargoPresign(@UserContext() user: TokenPayload, @Args('presignRequest') presignRequest: CargoPresignRequest): Promise<string> {
    return this.signService.presignRequest(user, presignRequest);
  }
}
