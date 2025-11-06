import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getProducts, createProduct, deleteProduct, updateProduct,
} from '../controllers/product';
import {
  productCreateValidationSchema,
  productUpdateValidationSchema,
  validateObjId,
} from '../middlewares/validation';
import { authCheck } from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);

router.post('/', celebrate({
  [Segments.BODY]: productCreateValidationSchema,
}), createProduct);

router.delete('/:id', authCheck, validateObjId, deleteProduct);

router.patch('/:id', authCheck, validateObjId, celebrate({
  [Segments.BODY]: productUpdateValidationSchema,
}), updateProduct);

export default router;
