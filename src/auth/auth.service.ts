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

@Injectable()
export class AuthService {
  private tokenBlacklist: Set<string> = new Set();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.sub !== userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);
      return { accessToken };
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
      expiresIn: '15m', // Short-lived access token
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
}
