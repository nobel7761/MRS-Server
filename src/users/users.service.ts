import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
import { UserStatus } from '../enums/users/users.enum';
import { UserRegistrationDto } from '../auth/auth.dto';
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

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken }).exec();
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { password }).exec();
  }

  async updateStatus(id: string, status: UserStatus): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { status }).exec();
  }
}
