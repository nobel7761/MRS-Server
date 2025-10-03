import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { JwtPayload } from '../auth/jwt-payload';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async loggedInUser(@AuthUser() user: JwtPayload) {
    return await this.usersService.findById(user.uid);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async allUsers(@AuthUser() user: JwtPayload, @Req() req: any) {
    console.log('user data', user);
    try {
      const result = await this.usersService.findAll(user);

      return result;
    } catch (error) {
      console.error('User Controller - Error:', error);
      throw error;
    }
  }
}
