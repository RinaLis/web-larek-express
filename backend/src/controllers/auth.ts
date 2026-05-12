import {
  NextFunction, Request, Response,
} from 'express';
import { Error as MongooseError } from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { REFRESH_TOKEN } from '../config';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';
import UnauthorizatedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';
import { UserIdRequest } from '../middlewares/auth';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  return User.findByCredentials(email, password)
    .then(async (user) => {
      const accessToken = user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();

      res.cookie(
        REFRESH_TOKEN.cookie.name,
        refreshToken,
        REFRESH_TOKEN.cookie.options,
      );
      res.status(200).json({
        success: true,
        user,
        accessToken,
      });
    })
    .catch((err) => {
      if (err instanceof UnauthorizatedError) {
        return next(err);
      }
      return next(err);
    });
};

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;
  return new User({ name, email, password }).save()
    .then(async (user) => {
      const accessToken = user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();

      res.cookie(
        REFRESH_TOKEN.cookie.name,
        refreshToken,
        REFRESH_TOKEN.cookie.options,
      );
      res.status(201).json({
        success: true,
        user,
        accessToken,
      });
    })
    .catch((err) => {
      if (err instanceof MongooseError.ValidationError) {
        return next(new BadRequestError(err.message));
      }
      if (err.message.includes('E11000')) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      return next(err);
    });
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as UserIdRequest;
    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError(''));
    }

    const { refreshToken } = req.cookies;

    user.tokens = user.tokens.filter(
      (tokenObj) => tokenObj.token !== refreshToken,
    );
    await user.save();

    const expireCookieOptions = {

      ...REFRESH_TOKEN.cookie.options,
      expires: new Date(0),
    };

    res.cookie(REFRESH_TOKEN.cookie.name, '', expireCookieOptions);
    res.status(200).json({
      success: true,
    });
    return next();
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as UserIdRequest;
    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    return next(err);
  }

  return next();
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as UserIdRequest;
    const { refreshToken } = req.cookies;
    const userWithRefreshTkn = await User.findOne({
      _id: userId,
      'tokens.token': refreshToken,
    });
    if (!userWithRefreshTkn) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    const newAccessTkn = await userWithRefreshTkn.generateAccessToken();

    res.status(201);
    res.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache' });
    res.json({
      success: true,
      accessToken: newAccessTkn,
    });
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizatedError('Пользователь неавторизован'));
    }
    return next(err);
  }
};
