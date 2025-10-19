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
import { EmailService } from '../email/services/email.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  UserRegistrationDto,
  ForgotPasswordDto,
  ResetPasswordWithTokenDto,
} from './auth.dto';
import { AuthUser, IAuthUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

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
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        membershipCategory: user.membershipCategory,
      },
      accessToken,
    });
  }

  @Post('login')
  async login(
    @Body('identifier') identifier: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    // console.log('identifier', identifier);
    // console.log('password', password);
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
          status: user.status,
          membershipCategory: user.membershipCategory,
          userType: user.userType,
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

  /**
   * Forgot Password Endpoint (Public - No Authentication Required)
   *
   * Purpose:
   * - Allows users to request a password reset when they forget their password
   * - Generates a secure token and sends it via email
   *
   * Flow:
   * 1. User provides their email or phone number
   * 2. System finds the user account
   * 3. Generates a secure random token (expires in 1 hour)
   * 4. Sends reset link to user's email
   * 5. Returns success message (doesn't reveal if user exists for security)
   *
   * Security Features:
   * - Token is hashed before storing in database
   * - Token expires after 1 hour
   * - Doesn't reveal if user exists or not
   * - Requires valid email address on account
   *
   * @param forgotPasswordDto - Contains identifier (email or phone)
   * @param res - Response object
   */
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() res: Response,
  ) {
    try {
      const { user, resetToken } = await this.authService.forgotPassword(
        forgotPasswordDto.identifier,
      );

      // Generate reset link (update FRONTEND_URL in .env for production)
      const frontendUrl = process.env.FRONTEND_URL;
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      // Send email with reset link
      try {
        await this.emailService.sendTestEmail(
          user.email,
          'Password Reset Request - NICAA',
          'password-reset',
          {
            userName: `${user.firstName} ${user.lastName}`,
            resetLink: resetLink,
            contactEmail: 'nic.alumniassociation.official@gmail.com',
            contactPhone: process.env.CONTACT_PHONE || '',
            currentYear: new Date().getFullYear(),
          },
        );
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Log the error but don't reveal it to the user for security
        // In production, you might want to log this to a monitoring service
      }

      // Return generic message (don't reveal if email was sent successfully)
      return res.json({
        message:
          'If an account with that identifier exists, you will receive a password reset email',
      });
    } catch (error) {
      // For security, return same message even if user not found
      return res.json({
        message:
          'If an account with that identifier exists, you will receive a password reset email',
      });
    }
  }

  /**
   * Reset Password with Token Endpoint (Public - No Authentication Required)
   *
   * Purpose:
   * - Allows users to reset their password using the token from email
   *
   * Flow:
   * 1. User clicks reset link in email (contains token)
   * 2. User provides new password
   * 3. System validates token (checks if valid and not expired)
   * 4. Updates user's password
   * 5. Clears reset token from database
   * 6. Optionally logs user out from all devices
   *
   * Security Features:
   * - Validates token matches stored hash
   * - Checks token hasn't expired (1 hour limit)
   * - Validates new password meets requirements
   * - Clears token after successful reset
   * - Logs user out from all devices (clears refresh tokens)
   *
   * @param resetPasswordDto - Contains token and new password
   * @param res - Response object
   */
  @Post('reset-password-with-token')
  async resetPasswordWithToken(
    @Body() resetPasswordDto: ResetPasswordWithTokenDto,
    @Res() res: Response,
  ) {
    try {
      await this.authService.resetPasswordWithToken(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );

      return res.json({
        message:
          'Password has been reset successfully. Please login with your new password.',
      });
    } catch (error) {
      return res.status(401).json({
        statusCode: 401,
        message:
          error.message || 'Password reset token is invalid or has expired',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @AuthUser() user: IAuthUser,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await this.authService.logout(user.uid, token);
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh-token',
    });

    return res.json({ message: 'Logged out successfully' });
  }
}
