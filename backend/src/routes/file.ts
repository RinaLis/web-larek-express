import { Router } from 'express';
import uploadFile from '../controllers/file';
import fileMiddleware from '../middlewares/file';

const uploadRouter = Router();

uploadRouter.post('/', fileMiddleware.single('file'), uploadFile);

export default uploadRouter;
