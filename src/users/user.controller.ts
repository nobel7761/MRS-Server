import { Controller, Get, UseGuards } from '@nestjs/common';
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
  // @UseGuards(JwtAuthGuard)
  async allUsers() {
    return await this.usersService.findAll();
  }
}
