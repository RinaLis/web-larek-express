import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import createOrder from '../controllers/order';
import { orderValidationSchema } from '../middlewares/validation';
import orderMiddleware from '../middlewares/order';

const router = Router();

router.post('/', celebrate({
  [Segments.BODY]: orderValidationSchema,
}), orderMiddleware, createOrder);

export default router;
