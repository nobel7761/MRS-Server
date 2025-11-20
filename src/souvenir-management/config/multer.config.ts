import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

export const multerConfig: MulterOptions = {
  // Use memory storage for Cloudinary uploads
  storage: memoryStorage(),
  fileFilter: (req, file, callback) => {
    // Allow images including HEIC format
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/heic',
      'image/heif',
      'image/avif',
    ];

    // Also allow HEIC files by extension since mimetype might not be set correctly
    const allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.svg',
      '.heic',
      '.heif',
      '.avif',
    ];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    if (
      allowedMimes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExtension)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(
          `Invalid file type. Only images are allowed. Received: ${file.mimetype || fileExtension}`,
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
};
