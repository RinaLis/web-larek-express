import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import ConflictError from '../errors/conflict-error';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import InternalServerError from '../errors/internal-server-error';

export const getProducts = (_req: Request, res: Response, next: NextFunction) => Product.find({})
  .then((products) => res.send({ items: products, total: products.length }))
  .catch(() => { next(new InternalServerError()); });

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, image, category, description, price,
  } = req.body;
  return Product.create({
    title, image, category, description, price,
  })
    .then((product) => {
      res.status(201).send({ data: product });
    })
    .catch((err) => {
      if (err instanceof MongooseError.ValidationError) {
        return next(new BadRequestError(err.message));
      }
      if (err.message.includes('E11000')) {
        return next(new ConflictError('Товар с таким заголовком уже существует'));
      }
      return next(new InternalServerError());
    });
};

export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  Product.findByIdAndDelete(id)
    .then((product) => {
      if (!product) {
        return next(new BadRequestError('Товара с данным id несуществует'));
      }
      res.send(product);
      return next();
    })
    .catch(() => next(new InternalServerError()));
};

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .then((product) => {
      if (!product) {
        return next(new BadRequestError('Товара с данным id несуществует'));
      }
      res.send(product);
      return next();
    })
    .catch((err) => {
      if (err instanceof BadRequestError) {
        return next(err);
      }
      return next(new InternalServerError());
    });
};
