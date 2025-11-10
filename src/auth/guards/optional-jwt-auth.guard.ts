import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return true;
      }
      throw error;
    }
  }

  handleRequest(err: any, user: any) {
    if (err && !(err instanceof UnauthorizedException)) {
      throw err;
    }
    return user || undefined;
  }
}
