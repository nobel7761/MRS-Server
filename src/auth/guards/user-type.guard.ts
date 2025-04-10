import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '../../enums/users/users.enum';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredUserTypes = this.reflector.getAllAndOverride<UserType[]>(
      'userTypes',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredUserTypes) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredUserTypes.includes(user.userType);
  }
}
