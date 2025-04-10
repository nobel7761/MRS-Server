import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../enums/users/users.enum';

export const USER_TYPES_KEY = 'userTypes';
export const UserTypes = (...userTypes: UserType[]) =>
  SetMetadata(USER_TYPES_KEY, userTypes);
