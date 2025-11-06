import { model, Schema } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import InternalServerError from '../errors/internal-server-error';
import BadRequestError from '../errors/bad-request-error';

export interface IProduct {
    title: string;
    image: {
      fileName: string,
      originalName: string;
    };
    category: string;
    description: string;
    price: number;
}

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
    required: [true, 'Поле "title" должно быть заполнено'],
    unique: true,
  },
  image: {
    fileName: {
      type: String,
      required: [true, 'Поле "fileName" должно быть заполнено'],
    },
    originalName: {
      type: String,
      required: [true, 'Поле "originalName" должно быть заполнено'],
    },
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    default: null,
  },
}, { versionKey: false });

productSchema.post('findOneAndDelete', (doc) => {
  fs.unlink(path.join(__dirname, '..', '..', 'public', doc.image.fileName), (err) => {
    if (err) {
      throw new InternalServerError();
    }
  });
});

function rewriteImageFromTemp(imageName: string) {
  const basePath = path.join(__dirname, '..', '..');
  const tempFilePath = path.join(basePath, 'upload', imageName);
  const newFilePath = path.join(basePath, 'public', 'images', imageName);
  if (fs.existsSync(newFilePath)) {
    return;
  }
  if (!fs.existsSync(tempFilePath)) {
    throw new BadRequestError('Путь к файлу неверный');
  }
  const reader = fs.createReadStream(tempFilePath, { encoding: 'base64' });
  const writer = fs.createWriteStream(newFilePath, { encoding: 'base64' });

  reader.pipe(writer);
}

productSchema.post('findOneAndUpdate', (doc) => {
  const imageName = path.parse(doc.image.fileName).base;
  if (!imageName) {
    throw new BadRequestError('Изображение не найдено');
  }
  rewriteImageFromTemp(imageName);
});

productSchema.post('save', (doc) => {
  const imageName = path.parse(doc.image.fileName).base;
  if (!imageName) {
    throw new BadRequestError('Изображение не найдено');
  }
  rewriteImageFromTemp(imageName);
});

export default model<IProduct>('Product', productSchema);
