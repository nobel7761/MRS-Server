import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../jwt-payload';

export type IAuthUser = JwtPayload;

export const AuthUser = createParamDecorator(
  (data, ctx: ExecutionContext): IAuthUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
