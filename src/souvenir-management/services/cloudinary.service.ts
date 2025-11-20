import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'souvenirs',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto', // Auto-detect image format including HEIC
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' },
            { width: 1920, height: 1920, crop: 'limit' }, // Square format limit
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Upload failed - no result returned'));
          }
        },
      );

      const readable = new Readable();
      readable._read = () => {};
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  extractPublicId(url: string): string {
    // Extract public ID from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicIdWithExtension = filename.split('.')[0];
    // Also need folder path
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
      const folderParts = parts.slice(uploadIndex + 1, -1);
      const folderPath =
        folderParts.length > 1 ? folderParts.slice(0, -1).join('/') : '';
      return folderPath
        ? `${folderPath}/${publicIdWithExtension}`
        : publicIdWithExtension;
    }
    return publicIdWithExtension;
  }
}
