import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  UserStatus,
  UserRole,
  MembershipCategory,
  UserType,
} from '../enums/users/users.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({
    required: true,
    // validate: {
    //   validator: (value: string) => /^[a-zA-Z\s]*$/.test(value),
    //   message: 'First name can only contain letters and spaces',
    // },
  })
  firstName: string;

  @Prop({
    required: true,
    // validate: {
    //   validator: (value: string) => /^[a-zA-Z\s]*$/.test(value),
    //   message: 'Last name can only contain letters and spaces',
    // },
  })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
  })
  phone: string;

  @Prop({
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (value: string) =>
        !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Please provide a valid email address',
    },
  })
  email: string;

  @Prop({
    required: true,
    select: false,
    validate: {
      validator: (value: string) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/.test(
          value,
        ),
      message:
        'Password must be 8-16 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  })
  password: string;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Prop({
    type: String,
    enum: UserType,
    default: UserType.VISITOR,
  })
  userType: UserType;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: MembershipCategory,
    default: MembershipCategory.FREE,
  })
  membershipCategory: MembershipCategory;

  // select: false means this field won't be returned in queries by default
  // This is a security measure to prevent the refresh token from being exposed
  // It can still be explicitly included using .select('+refreshToken') when needed

  @Prop({ select: false })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
