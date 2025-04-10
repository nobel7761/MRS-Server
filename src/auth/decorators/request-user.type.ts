import { UsersService } from '../../users/users.service';

export type RequestUserType = Awaited<ReturnType<UsersService['findById']>>;
