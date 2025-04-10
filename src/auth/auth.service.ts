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
import { UserRole, UserType } from '../enums/users/users.enum';
import { comparePassword } from '../utils/password.util';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    createUserDto: UserRegistrationDto,
  ): Promise<{ user: User; accessToken: string }> {
    const isUserExists = await this.usersService.isUserExists(
      createUserDto?.email || '',
      createUserDto.phone,
    );

    if (isUserExists) {
      throw new BadRequestException('User already exists');
    }

    // Check if SUPER_ADMIN must be OWNER type
    if (createUserDto.role === UserRole.SUPER_ADMIN) {
      if (createUserDto.userType !== UserType.OWNER) {
        throw new BadRequestException(
          'Super admin users must have Owner user type',
        );
      }
    }

    // Check if ADMIN cannot be EMPLOYEE type
    if (createUserDto.role === UserRole.ADMIN) {
      if (createUserDto.userType === UserType.EMPLOYEE) {
        throw new BadRequestException(
          'Admin users cannot have Employee user type',
        );
      }
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

      const isPasswordValid = comparePassword(user.password, password);
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
    const user = await this.usersService.findById(userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.generateAccessToken(user);
    return { accessToken };
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
      userType: user.userType,
      status: user.status,
    };
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(user: User): string {
    const payload = { sub: user._id };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
