import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { JwtPayload } from '../auth/jwt-payload';
import { UpdateUserDto } from './users.dto';

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
    try {
      const result = await this.usersService.findAll(user);

      return result;
    } catch (error) {
      console.error('User Controller - Error:', error);
      throw error;
    }
  }

  @Get('collectors')
  @UseGuards(JwtAuthGuard)
  async getAllCollectors() {
    try {
      const collectors = await this.usersService.findAllCollectors();
      return collectors;
    } catch (error) {
      console.error('User Controller - Get Collectors Error:', error);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.usersService.findById(id);

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('User Controller - Get User By Id Error:', error);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.usersService.updateUser(id, updateUserDto);

      return {
        message: 'User updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      console.error('User Controller - Update User Error:', error);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string) {
    try {
      await this.usersService.deleteUser(id);

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      console.error('User Controller - Delete User Error:', error);
      throw error;
    }
  }
}
