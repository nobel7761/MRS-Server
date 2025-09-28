import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

export const multerConfig: MulterOptions = {
  // Use memory storage for Cloudinary uploads
  storage: memoryStorage(),
  fileFilter: (req, file, callback) => {
    // Allow images and videos
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/3gp',
      'video/mkv',
      'video/m4v',
      'video/mpg',
      'video/mpeg',
      'video/ogg',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          `Invalid file type. Only images and videos are allowed. Received: ${file.mimetype}`,
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for free tier
  },
};
