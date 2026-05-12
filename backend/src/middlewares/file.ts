import multer from 'multer';
import { IMAGE_LIMITS } from '../config';

const fileMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: IMAGE_LIMITS.maxSize,
  },
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_LIMITS.allowedFileMimetypeAndExtensions.includes(file.mimetype)) {
      return cb(new Error('Неверное разрешение файла'));
    }
    return cb(null, true);
  },
});

export default fileMiddleware;
