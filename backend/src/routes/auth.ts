import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  login, signUp, logout, getCurrentUser, refreshAccessToken,
} from '../controllers/auth';
import { authCheck } from '../middlewares/auth';
import { userRegisterSchema, userLoginSchema } from '../middlewares/validation';

const router = Router();

router.post('/login', celebrate({
  [Segments.BODY]: userLoginSchema,
}), login);
router.post('/register', celebrate({
  [Segments.BODY]: userRegisterSchema,
}), signUp);
router.get('/token', refreshAccessToken);
router.get('/logout', authCheck, logout);
router.get('/user', authCheck, getCurrentUser);

export default router;
