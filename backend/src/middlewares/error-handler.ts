import { NextFunction, Request, Response } from 'express';
import NotFoundError from '../errors/not-found-error';
import UnauthorizatedError from '../errors/unauthorized-error';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

const errorHandlingMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof BadRequestError
    || error instanceof UnauthorizatedError
    || error instanceof ConflictError
    || error instanceof NotFoundError
  ) {
    res.status(error.statusCode).send({ message: error.message });
  } else {
    res.status(500).send({ message: 'Внутренняя ошибка сервера' });
  }
};

export default errorHandlingMiddleware;
