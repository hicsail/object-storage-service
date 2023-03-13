import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenPayload } from './user.dto';

export const isServiceAccount = (user: TokenPayload) => {
  return (user.role & 1) === 1;
};

@Injectable()
export class ServiceAccountGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const user: TokenPayload = ctx.getContext().req.user;

    return isServiceAccount(user);
  }
}
