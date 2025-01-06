import { UserTypes } from 'src/v1/user/user.interface';

export enum RedisKeys {
  EMAIL_VERIFICATION_TOKEN = 'email_verification_token',
  ACCESS_TOKEN = 'access_token',
}

export interface RedisAccessToken {
  userId: number;
  rememberMe: boolean;
  createdAt: number;
  userType: UserTypes;
}

export interface RedisEmailVerification {
  userId: number;
  email: string;
  createdAt: number;
}
