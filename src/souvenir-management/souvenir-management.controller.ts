import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { SouvenirManagementService } from './souvenir-management.service';
import { CreateSouvenirDto } from './dto/create-souvenir.dto';
import { UpdateSouvenirDto } from './dto/update-souvenir.dto';
import { SouvenirQueryDto } from './dto/souvenir-query.dto';
import {
  SouvenirResponseDto,
  SouvenirListResponseDto,
} from './dto/souvenir-response.dto';
import { multerMultipleConfig } from './config/multer-multiple.config';
import { UnifiedFileUploadInterceptor } from './interceptors/unified-file-upload.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';

@Controller('souvenir-management')
export class SouvenirManagementController {
  constructor(
    private readonly souvenirManagementService: SouvenirManagementService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    AnyFilesInterceptor(multerMultipleConfig),
    UnifiedFileUploadInterceptor,
  )
  async create(
    @Body() createDto: CreateSouvenirDto,
  ): Promise<SouvenirResponseDto> {
    // Validation is handled in the service
    return this.souvenirManagementService.create(createDto);
  }

  @Get()
  async findAll(
    @Query() queryDto: SouvenirQueryDto,
  ): Promise<SouvenirListResponseDto> {
    return this.souvenirManagementService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SouvenirResponseDto> {
    return this.souvenirManagementService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSouvenirDto,
  ): Promise<SouvenirResponseDto> {
    return this.souvenirManagementService.update(id, updateDto);
  }

  @Patch(':id/photo')
  @UseInterceptors(
    FileInterceptor('photo', multerConfig),
    FileUploadInterceptor,
  )
  async updatePhoto(
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<SouvenirResponseDto> {
    if (!body.photoUrl) {
      throw new BadRequestException('Photo upload is required');
    }

    return this.souvenirManagementService.update(id, {
      photoUrl: body.photoUrl,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.souvenirManagementService.remove(id);
  }
}
