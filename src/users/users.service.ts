import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
import { UserStatus, UserType } from '../enums/users/users.enum';
import { UserRegistrationDto } from 'src/auth/auth.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: UserRegistrationDto): Promise<User> {
    if (!createUserDto.phone) {
      throw new BadRequestException('Phone is required');
    }

    if (!createUserDto.password) {
      throw new BadRequestException('Password is required');
    }

    const query: any = { phone: createUserDto.phone };
    if (createUserDto.email) {
      query.email = createUserDto.email;
    }

    const isUserExists = await this.userModel.findOne({
      $or: [
        { phone: createUserDto.phone },
        ...(createUserDto.email ? [{ email: createUserDto.email }] : []),
      ],
    });

    if (isUserExists) {
      throw new BadRequestException('User already exists');
    }

    const createdUser = new this.userModel(createUserDto);
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
