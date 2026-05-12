import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const orderMiddleware = async (req: Request, _: Response, next: NextFunction) => {
  const { items, total } = req.body;
  const itemProducts = await Promise.all(items.map((item: Types.ObjectId) => Product.findById(item)
    .then((product) => {
      if (!product) {
        throw new BadRequestError(`Товар с id ${item} не найден`);
      }
      const productPrice = product?.price;
      if (!productPrice) {
        throw new BadRequestError(`Товар с id ${item} не продается`);
      }
      return productPrice;
    })))
    .catch((err) => {
      if (err instanceof BadRequestError) {
        return next(err);
      }
      return next(err);
    });

  if (itemProducts) {
    const totalPrice = itemProducts.reduce((sum, price) => sum + price, 0);

    if (totalPrice !== total) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }

    return next();
  }
  return next(new Error());
};

export default orderMiddleware;
