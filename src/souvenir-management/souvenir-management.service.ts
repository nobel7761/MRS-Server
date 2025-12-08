import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Souvenir, SouvenirDocument } from './schemas/souvenir.schema';
import { CreateSouvenirDto } from './dto/create-souvenir.dto';
import { UpdateSouvenirDto } from './dto/update-souvenir.dto';
import { SouvenirQueryDto } from './dto/souvenir-query.dto';
import {
  SouvenirResponseDto,
  SouvenirListResponseDto,
} from './dto/souvenir-response.dto';

@Injectable()
export class SouvenirManagementService {
  constructor(
    @InjectModel(Souvenir.name)
    private souvenirModel: Model<SouvenirDocument>,
  ) {}

  async create(createDto: CreateSouvenirDto): Promise<SouvenirResponseDto> {
    try {
      // Validate based on category
      if (createDto.category === 'photo-gallery') {
        // For photo-gallery: require photoUrls, content is optional
        if (!createDto.photoUrls || createDto.photoUrls.length === 0) {
          throw new BadRequestException(
            'At least 1 photo is required for photo-gallery category',
          );
        }
        if (createDto.photoUrls.length > 10) {
          throw new BadRequestException(
            'Maximum 10 photos allowed for photo-gallery category',
          );
        }
        // Ensure photoUrl is not set for photo-gallery
        if (createDto.photoUrl) {
          throw new BadRequestException(
            'photoUrl should not be set for photo-gallery category. Use photoUrls instead.',
          );
        }
      } else {
        // For other categories: require photoUrl and content
        if (!createDto.photoUrl) {
          throw new BadRequestException(
            'Photo upload is required for non-photo-gallery categories',
          );
        }
        if (!createDto.content) {
          throw new BadRequestException(
            'Content is required for non-photo-gallery categories',
          );
        }
        // Ensure photoUrls is not set for non-photo-gallery
        if (createDto.photoUrls && createDto.photoUrls.length > 0) {
          throw new BadRequestException(
            'photoUrls should not be set for non-photo-gallery categories. Use photoUrl instead.',
          );
        }
      }

      const souvenir = new this.souvenirModel(createDto);
      const savedSouvenir = await souvenir.save();
      return this.mapToResponseDto(savedSouvenir);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create souvenir: ${error.message}`,
      );
    }
  }

  async findAll(queryDto: SouvenirQueryDto): Promise<SouvenirListResponseDto> {
    try {
      const {
        category,
        batch,
        group,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = queryDto;

      // Build filter
      const filter: any = {};

      if (category) {
        filter.category = category;
      }

      if (batch) {
        filter.batch = batch;
      }

      if (group) {
        filter.group = group;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query - fetch all data without pagination
      const [souvenirs, total] = await Promise.all([
        this.souvenirModel.find(filter).sort(sort).exec(),
        this.souvenirModel.countDocuments(filter).exec(),
      ]);

      return {
        souvenirs: souvenirs.map((souvenir) => this.mapToResponseDto(souvenir)),
        total,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch souvenirs: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<SouvenirResponseDto> {
    try {
      const souvenir = await this.souvenirModel.findById(id).exec();

      if (!souvenir) {
        throw new NotFoundException(`Souvenir with ID ${id} not found`);
      }

      return this.mapToResponseDto(souvenir);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch souvenir: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateDto: UpdateSouvenirDto,
  ): Promise<SouvenirResponseDto> {
    try {
      const updatedSouvenir = await this.souvenirModel
        .findByIdAndUpdate(id, updateDto, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedSouvenir) {
        throw new NotFoundException(`Souvenir with ID ${id} not found`);
      }

      return this.mapToResponseDto(updatedSouvenir);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update souvenir: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const deletedSouvenir = await this.souvenirModel
        .findByIdAndDelete(id)
        .exec();

      if (!deletedSouvenir) {
        throw new NotFoundException(`Souvenir with ID ${id} not found`);
      }

      return { message: 'Souvenir deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete souvenir: ${error.message}`,
      );
    }
  }

  private mapToResponseDto(souvenir: SouvenirDocument): SouvenirResponseDto {
    const response: SouvenirResponseDto = {
      _id: souvenir._id.toString(),
      category: souvenir.category,
      name: souvenir.name,
      batch: souvenir.batch,
      group: souvenir.group,
      phoneNumber: souvenir.phoneNumber,
      email: souvenir.email,
      professionalDetails: souvenir.professionalDetails,
      createdAt: souvenir.createdAt,
      updatedAt: souvenir.updatedAt,
    };

    // Set photoUrl or photoUrls based on category
    if (souvenir.category === 'photo-gallery') {
      response.photoUrls = souvenir.photoUrls || [];
    } else {
      response.photoUrl = souvenir.photoUrl;
    }

    // Content is optional for photo-gallery
    if (souvenir.content) {
      response.content = souvenir.content;
    }

    return response;
  }
}
