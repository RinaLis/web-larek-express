import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import errorHandlingMiddleware from './middlewares/error-handler';
import productRoute from './routes/product';
import orderRoute from './routes/order';
import authRoute from './routes/auth';
import uploadRouter from './routes/file';
import { requestLogger, errorLogger } from './middlewares/logger';

const { PORT = 3000, DB_ADDRESS } = process.env;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173', // Разрешаем доступ только с этого источника
  credentials: true, // Разрешаем отправку учётных данных (если нужно)
}));

mongoose.connect(`${DB_ADDRESS}`);

app.use(requestLogger);

app.use('/images', express.static(path.join('public', 'images')));
app.use('/product', productRoute);
app.use('/order', orderRoute);
app.use('/auth', authRoute);
app.use('/upload', uploadRouter);

app.use(errorLogger);

app.use(errors());
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
