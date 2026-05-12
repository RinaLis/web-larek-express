import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Joi } from 'celebrate';
import BadRequestError from '../errors/bad-request-error';

export const validateObjId = (req: Request, _: Response, next: NextFunction) => {
  const { id } = req.params;
  if (new ObjectId(id).toString() !== id) {
    return next(new BadRequestError('Переданный id невалиден'));
  }
  return next();
};

export const productCreateValidationSchema = Joi.object({
  title: Joi.string().min(2).max(30).required(),
  image: {
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  },
  category: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().default(null),
});

export const productUpdateValidationSchema = Joi.object({
  title: Joi.string().min(2).max(30),
  image: {
    fileName: Joi.string(),
    originalName: Joi.string(),
  },
  category: Joi.string(),
  description: Joi.string(),
  price: Joi.number().default(null),
});

enum PaymentEnum {
  Card = 'card',
  Online = 'online'
}

export const orderValidationSchema = Joi.object({
  items: Joi.array().items(Joi.string()).min(1).required(),
  total: Joi.number().required(),
  payment: Joi.string().valid(PaymentEnum.Card, PaymentEnum.Online).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
});

export const userRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(30).default('Ё-мое'),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
