import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';

const createOrder = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).send({ total: req.body.total, id: faker.string.uuid() });
  } catch (err) {
    next(err);
  }
};

export default createOrder;
