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
export class MultipleFileUploadInterceptor implements NestInterceptor {
  constructor(private cloudinaryService: CloudinaryService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const files = request.files;

    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Validate file count (1-10 photos)
    if (files.length < 1) {
      throw new BadRequestException('At least 1 photo is required');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 photos allowed');
    }

    // Validate each file size (5MB max per file)
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds 5MB size limit`,
        );
      }
    }

    try {
      // Upload all files to Cloudinary
      const uploadPromises = files.map((file: Express.Multer.File) =>
        this.cloudinaryService.uploadImage(file, 'souvenirs'),
      );

      const cloudinaryUrls = await Promise.all(uploadPromises);

      // Add the cloudinary URLs array to the request body
      request.body.photoUrls = cloudinaryUrls;

      return next.handle();
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload files to cloud storage: ${error.message}`,
      );
    }
  }
}
