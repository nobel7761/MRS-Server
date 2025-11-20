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
export class FileUploadInterceptor implements NestInterceptor {
  constructor(private cloudinaryService: CloudinaryService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Upload to Cloudinary
      const cloudinaryUrl = await this.cloudinaryService.uploadImage(
        file,
        'souvenirs',
      );

      // Add the cloudinary URL to the request body
      request.body.photoUrl = cloudinaryUrl;

      return next.handle();
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload file to cloud storage: ${error.message}`,
      );
    }
  }
}
