import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRegistrationDto } from './auth.dto';
import { AuthUser, IAuthUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createUserDto: UserRegistrationDto,
    @Res() res: Response,
  ) {
    const { user, accessToken } =
      await this.authService.register(createUserDto);
    const refreshToken = await this.authService.generateRefreshToken(user);

    this.authService.setRefreshTokenCookie(res, refreshToken);

    return res.json({
      user,
      accessToken,
    });
  }

  @Post('login')
  async login(
    @Body('identifier') identifier: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    try {
      const { user, accessToken } = await this.authService.login(
        identifier,
        password,
      );
      const refreshToken = await this.authService.generateRefreshToken(user);

      this.authService.setRefreshTokenCookie(res, refreshToken);

      return res.json({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        accessToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        return res.status(401).json({
          statusCode: 401,
          message: error.message,
        });
      }
      return res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }

  @Post('refresh-token')
  async refreshToken(
    @AuthUser() user: IAuthUser,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { accessToken } = await this.authService.refreshToken(
      user.uid,
      refreshToken,
    );

    return res.json({ accessToken });
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @AuthUser() user: IAuthUser,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.changePassword(user.uid, oldPassword, newPassword);
    return { message: 'Password changed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  async resetPassword(
    @AuthUser() user: IAuthUser,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(user.uid, newPassword);
    return { message: 'Password reset successfully' };
  }
}
