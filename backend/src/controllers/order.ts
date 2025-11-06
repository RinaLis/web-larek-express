import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import InternalServerError from '../errors/internal-server-error';

const createOrder = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).send({ total: req.body.total, id: faker.string.uuid() });
  } catch {
    next(new InternalServerError());
  }
};

export default createOrder;
