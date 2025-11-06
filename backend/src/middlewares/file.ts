import multer from 'multer';

const IMAGE_MAX_SIZE = 10000000;
const allowedFileMimetypeAndExtensions = ['image/png', 'image/jpg', 'image/jpeg'];

const fileMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: IMAGE_MAX_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedFileMimetypeAndExtensions.includes(file.mimetype)) {
      return cb(new Error('Неверное разрешение файла'));
    }
    return cb(null, true);
  },
});

export default fileMiddleware;
