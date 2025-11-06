import { NextFunction, Request, Response } from 'express';

const errorHandlingMiddleware = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(error.statusCode).send({ message: error.message });
};

export default errorHandlingMiddleware;
