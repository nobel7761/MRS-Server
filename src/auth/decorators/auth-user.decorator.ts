import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUserType } from './request-user.type';

export const AuthUser = createParamDecorator(
  (_, ctx: ExecutionContext): RequestUserType => {
    const req = ctx.switchToHttp().getRequest();
    if (!req.user) {
      throw new Error('User not found in request');
    }
    return req.user;
  },
);
