import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UnauthorizatedError from '../errors/unauthorized-error';

export interface UserIdRequest extends Request {
  userId: string
}

export interface UserJwtPayload extends JwtPayload {
  _id: string
}

export const authCheck = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  const token = req.cookies.accessToken;
  if ((!authorization || !authorization.startsWith('Bearer ')) && !token) {
    return next(new UnauthorizatedError('Необходима авторизация'));
  }
  const accessToken = authorization?.replace('Bearer ', '') || token;

  if (!accessToken) {
    return next(new UnauthorizatedError('Необходима авторизация'));
  }

  let payload;
  try {
    payload = jwt.verify(accessToken, `${process.env.AUTH_ACCESS_TOKEN_SECRET}`) as UserJwtPayload;
    (req as UserIdRequest).userId = payload._id;
  } catch (err) {
    return next(new UnauthorizatedError('Необходима авторизация'));
  }
  return next();
};
