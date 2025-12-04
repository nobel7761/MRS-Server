import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CloudinaryService } from '../services/cloudinary.service';

@Injectable()
export class UnifiedFileUploadInterceptor implements NestInterceptor {
  constructor(private cloudinaryService: CloudinaryService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const allFiles = request.files || [];
    const category = request.body?.category;

    // Determine if this is photo-gallery category
    const isPhotoGallery = category === 'photo-gallery';

    if (isPhotoGallery) {
      // For photo-gallery: look for files with field name 'photos[]'
      const photoFiles = Array.isArray(allFiles)
        ? allFiles.filter(
            (f: Express.Multer.File) =>
              f.fieldname === 'photos[]' || f.fieldname === 'photos',
          )
        : [];

      if (photoFiles.length === 0) {
        throw new BadRequestException(
          'At least 1 photo is required for photo-gallery category. Use field name "photos[]"',
        );
      }

      if (photoFiles.length > 10) {
        throw new BadRequestException(
          'Maximum 10 photos allowed for photo-gallery category',
        );
      }

      // Validate each file size (5MB max per file)
      for (const fileItem of photoFiles) {
        if (fileItem.size > 5 * 1024 * 1024) {
          throw new BadRequestException(
            `File ${fileItem.originalname} exceeds 5MB size limit`,
          );
        }
      }

      try {
        // Upload all files to Cloudinary
        const uploadPromises = photoFiles.map((fileItem: Express.Multer.File) =>
          this.cloudinaryService.uploadImage(fileItem, 'souvenirs'),
        );

        const cloudinaryUrls = await Promise.all(uploadPromises);

        // Add the cloudinary URLs array to the request body
        request.body.photoUrls = cloudinaryUrls;
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload files to cloud storage: ${error.message}`,
        );
      }
    } else {
      // For other categories: look for file with field name 'photo'
      const photoFile = Array.isArray(allFiles)
        ? allFiles.find((f: Express.Multer.File) => f.fieldname === 'photo')
        : allFiles?.fieldname === 'photo'
          ? allFiles
          : null;

      if (!photoFile) {
        throw new BadRequestException(
          'Photo upload is required. Use field name "photo"',
        );
      }

      try {
        // Upload to Cloudinary
        const cloudinaryUrl = await this.cloudinaryService.uploadImage(
          photoFile,
          'souvenirs',
        );

        // Add the cloudinary URL to the request body
        request.body.photoUrl = cloudinaryUrl;
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload file to cloud storage: ${error.message}`,
        );
      }
    }

    return next.handle();
  }
}
