import express, {
  NextFunction, Request, Response,
} from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import { rateLimit } from 'express-rate-limit';
import errorHandlingMiddleware from './middlewares/error-handler';
import NotFoundError from './errors/not-found-error';
import productRoute from './routes/product';
import orderRoute from './routes/order';
import authRoute from './routes/auth';
import uploadRouter from './routes/file';
import { requestLogger, errorLogger } from './middlewares/logger';

const { PORT = 3000, DB_ADDRESS } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`.
});

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.use(cors({
  origin: 'http://localhost:5173', // Разрешаем доступ только с этого источника
  credentials: true, // Разрешаем отправку учётных данных (если нужно)
}));

mongoose.connect(`${DB_ADDRESS}`);

app.use(requestLogger);

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/product', productRoute);
app.use('/order', orderRoute);
app.use('/auth', authRoute);
app.use('/upload', uploadRouter);
app.use('*', (_req: Request, _res: Response, next: NextFunction) => next(new NotFoundError('Запрашиваемый ресурс не найден')));

app.use(errorLogger);

app.use(errors());
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
