import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsEnum,
} from 'class-validator';
import { UserRole, UserType } from '../enums/users/users.enum';

export class UserRegistrationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+88)?01[3-9]\d{8}$/, {
    message: 'Please provide a valid Bangladeshi phone number',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
    {
      message:
        'Password must be 8-16 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @IsString()
  @IsOptional()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Please provide a valid email address',
  })
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;
}

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
