import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RequestUserType } from './request-user.type';

interface RequestWithUser extends Request {
  user: {
    user: RequestUserType;
  };
}

export const AuthUser = createParamDecorator(
  (_, ctx: ExecutionContext): RequestUserType => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return req.user.user;
  },
);
