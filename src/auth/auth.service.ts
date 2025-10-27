import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { User } from '../users/users.model';
import { UserRegistrationDto } from './auth.dto';
import { UserRole } from '../enums/users/users.enum';
import { comparePassword } from '../utils/password.util';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private tokenBlacklist: Set<string> = new Set();

  constructor(
    private readonly usersService: UsersService,
    public readonly jwtService: JwtService,
  ) {}

  async register(
    createUserDto: UserRegistrationDto,
  ): Promise<{ user: User; accessToken: string }> {
    const isUserExists = await this.usersService.isUserExists(
      createUserDto?.email || '',
      createUserDto.phoneNumber,
    );

    if (isUserExists) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.usersService.create(createUserDto);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.usersService.updateRefreshToken(user._id, refreshToken);

    return { user, accessToken };
  }

  async login(
    identifier: string,
    password: string,
  ): Promise<{ user: User; accessToken: string }> {
    const user = await this.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email/phone or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.usersService.updateRefreshToken(user._id, refreshToken);

    return { user, accessToken };
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    // Add the access token to the blacklist
    this.tokenBlacklist.add(accessToken);

    // Clear the refresh token from the user document
    await this.usersService.updateRefreshToken(userId, null);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<User | null> {
    try {
      const user =
        (await this.usersService.findByEmail(identifier)) ||
        (await this.usersService.findByPhone(identifier));

      if (!user) {
        return null;
      }

      const isPasswordValid = await comparePassword(user.password, password);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error in validateUser:', error);
      return null;
    }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const userId = payload.sub;
      if (!userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user with refresh token to verify it matches
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User is not active');
      }

      // Verify the refresh token matches the one stored in database
      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update the refresh token in database
      await this.usersService.updateRefreshToken(user._id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user || !comparePassword(user.password, oldPassword)) {
      throw new UnauthorizedException('Invalid old password');
    }

    await this.usersService.updatePassword(userId, newPassword);
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await this.usersService.updatePassword(userId, newPassword);
  }

  generateAccessToken(user: User): string {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1h', // Increased to 1 hour for better user experience
    });

    return token;
  }

  generateRefreshToken(user: User): string {
    const payload = {
      sub: user._id,
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d', // Longer-lived refresh token
    });
  }

  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
      sameSite: 'strict', // Prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh-token', // Only sent to refresh token endpoint
    });
  }

  /**
   * Initiates the password reset process
   * Generates a secure token and stores it with expiry time
   * Returns the token (to be sent via email in the controller)
   * @param identifier - User's email or phone number
   * @returns Object containing user info and reset token
   */
  async forgotPassword(
    identifier: string,
  ): Promise<{ user: User; resetToken: string }> {
    // Find user by email or phone
    const user =
      (await this.usersService.findByEmail(identifier)) ||
      (await this.usersService.findByPhone(identifier));

    if (!user) {
      // For security, don't reveal if user exists or not
      throw new BadRequestException(
        'If an account with that identifier exists, you will receive a password reset email',
      );
    }

    // Check if user has an email address
    if (!user.email) {
      throw new BadRequestException(
        'This account does not have an email address. Please contact support.',
      );
    }

    // Generate a secure random token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing (adds extra security layer)
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store hashed token and expiry in database
    await this.usersService.setPasswordResetToken(
      user._id.toString(),
      hashedToken,
      expiresAt,
    );

    // Return the unhashed token (to be sent via email)
    // and user info (to be used for sending email)
    return {
      user,
      resetToken, // This is the unhashed token that will be sent to user
    };
  }

  /**
   * Resets user's password using the reset token
   * @param token - Reset token from email
   * @param newPassword - New password to set
   */
  async resetPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<void> {
    // Hash the provided token to match with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by token and check if it's not expired
    const user = await this.usersService.findByPasswordResetToken(hashedToken);

    if (!user) {
      throw new UnauthorizedException(
        'Password reset token is invalid or has expired',
      );
    }

    // Update user's password
    await this.usersService.updatePassword(user._id.toString(), newPassword);

    // Clear the reset token after successful password reset
    await this.usersService.clearPasswordResetToken(user._id.toString());

    // Optional: Clear all refresh tokens to log user out of all devices
    await this.usersService.updateRefreshToken(user._id.toString(), null);
  }
}
