import { CookieOptions } from 'express';
import ms, { StringValue } from 'ms';

export const ACCESS_TOKEN = {
  secret: process.env.AUTH_ACCESS_TOKEN_SECRET || 'super-strong-secret',
  expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '1m',
};
export const REFRESH_TOKEN = {
  secret: process.env.AUTH_REFRESH_TOKEN_SECRET || 'some-secret-refresh-key',
  expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
  cookie: {
    name: 'refreshToken',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms(process.env.AUTH_REFRESH_TOKEN_SECRET as StringValue || '7d'),
      path: '/',
    } as CookieOptions,
  },
};

export const BCRYPT_SALT = Number(process.env.BCRYPT_SALT) || 10;

export const RANDOM_IMAGE_NAME_SIZE = 16;

export const IMAGE_LIMITS = {
  maxSize: 10000000,
  allowedFileMimetypeAndExtensions: ['image/png', 'image/jpg', 'image/jpeg'],
};
