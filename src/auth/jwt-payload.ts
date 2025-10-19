import { UserType, UserStatus, UserRole } from '../enums/users/users.enum';

export interface JwtPayload {
  _id?: string;
  uid: string; // User ID
  userType: UserType;
  status: UserStatus;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
}
