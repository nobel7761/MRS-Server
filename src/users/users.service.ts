import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
import { UserStatus, UserType } from '../enums/users/users.enum';
import { UserRegistrationDto } from '../auth/auth.dto';
import { JwtPayload } from 'src/auth/jwt-payload';
import { UpdateUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: UserRegistrationDto): Promise<User> {
    if (!createUserDto.phoneNumber) {
      throw new BadRequestException('Phone is required');
    }

    if (!createUserDto.password) {
      throw new BadRequestException('Password is required');
    }

    // Transform phoneNumber to phone for database storage
    const userData: any = {
      ...createUserDto,
      phone: createUserDto.phoneNumber,
    };
    delete userData.phoneNumber;

    const query: any = { phone: createUserDto.phoneNumber };
    if (createUserDto.email) {
      query.email = createUserDto.email;
    }

    const isUserExists = await this.userModel.findOne({
      $or: [
        { phone: createUserDto.phoneNumber },
        ...(createUserDto.email ? [{ email: createUserDto.email }] : []),
      ],
    });

    if (isUserExists) {
      throw new BadRequestException('User already exists');
    }

    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userModel.findOne({ phone }).select('+password').exec();
  }

  async isUserExists(email: string, phone: string): Promise<boolean> {
    const isUserExists = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });
    return isUserExists ? true : false;
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(user: JwtPayload): Promise<User[]> {
    // If logged in user is not owner, return all users except owners
    if (user.userType !== UserType.OWNER) {
      const result = await this.userModel
        .find({ userType: { $ne: UserType.OWNER } })
        .exec();

      return result;
    }

    // If logged in user is owner, return all users

    const result = await this.userModel.find().exec();

    return result;
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken }).exec();
  }

  async updatePassword(id: string, password: string): Promise<void> {
    // Find user and update password, then save to trigger pre-save hook
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = password;
    await user.save(); // This triggers the pre-save middleware to hash the password
  }

  async updateStatus(id: string, status: UserStatus): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { status }).exec();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if phone or email already exists for another user
    if (updateUserDto.phone || updateUserDto.email) {
      const duplicateCheck: any = { _id: { $ne: id } };
      const orConditions: any[] = [];

      if (updateUserDto.phone) {
        orConditions.push({ phone: updateUserDto.phone });
      }
      if (updateUserDto.email) {
        orConditions.push({ email: updateUserDto.email });
      }

      if (orConditions.length > 0) {
        duplicateCheck.$or = orConditions;
        const duplicate = await this.userModel.findOne(duplicateCheck);

        if (duplicate) {
          throw new BadRequestException('Phone or email already exists');
        }
      }
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async setPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
      })
      .exec();
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }, // Token must not be expired
      })
      .select('+passwordResetToken +passwordResetExpires')
      .exec();
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .exec();
  }
}
