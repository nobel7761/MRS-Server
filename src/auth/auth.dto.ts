import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsEnum,
} from 'class-validator';
import { UserRole, MembershipCategory } from '../enums/users/users.enum';

export class UserRegistrationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+88)?01[3-9]\d{8}$/, {
    message: 'Please provide a valid Bangladeshi phone number',
  })
  phoneNumber: string;

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
  @IsEnum(MembershipCategory)
  membershipCategory?: MembershipCategory;
}

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Can be email or phone number
}

export class ResetPasswordWithTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string; // Reset token sent via email

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
    {
      message:
        'Password must be 8-16 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword: string;
}
