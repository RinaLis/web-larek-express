import { NextFunction, Request, Response } from 'express';
import FileType from 'file-type';
import * as fs from 'fs';
import * as path from 'path';
import { RANDOM_IMAGE_NAME_SIZE } from '../config';
import BadRequestError from '../errors/bad-request-error';

const makeid = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  const { file } = req;
  if (!file) {
    return next(new BadRequestError('Проверьте файл изображения'));
  }
  const meta = await FileType.fileTypeFromBuffer(file.buffer as Uint8Array);

  if (!meta) {
    return next(new BadRequestError('Произошла ошибка при загрузке изображения. Попробуйте еще раз.'));
  }

  const base64EncodedImage = Buffer.from(file.buffer as Uint8Array).toString('base64');
  const fileName = `${makeid(RANDOM_IMAGE_NAME_SIZE)}_${file.originalname.toLowerCase().split(' ').join('-')}`;
  const writeStream = fs.createWriteStream(path.join(__dirname, '..', '..', 'upload', fileName), { encoding: 'base64' });
  writeStream.write(base64EncodedImage);
  writeStream.end();

  res.status(200).send({
    fileName: `/images/${fileName}`,
    originalName: file.originalname,
  });
  return next();
};

export default uploadFile;
