import { UserType, UserStatus, UserRole } from '../enums/users/users.enum';

export interface JwtPayload {
  uid: string; // User ID
  userType: UserType;
  status: UserStatus;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
}
