import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import {
  EventResponseDto,
  EventListResponseDto,
} from './dto/event-response.dto';
import { multerConfig } from './config/multer.config';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('bannerImage', multerConfig),
    FileUploadInterceptor,
  )
  //   @UseGuards(JwtAuthGuard, RolesGuard, UserTypeGuard)
  //   @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  //   @UserTypes(UserType.ADMIN, UserType.MODERATOR)
  async create(
    @Body() createEventDto: CreateEventDto,
    @Request() req: any,
  ): Promise<EventResponseDto> {
    return this.eventService.create(createEventDto);
  }

  @Get()
  async findAll(
    @Query() queryDto: EventQueryDto,
  ): Promise<EventListResponseDto> {
    return this.eventService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  //   @UseGuards(JwtAuthGuard, RolesGuard, UserTypeGuard)
  //   @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  //   @UserTypes(UserType.ADMIN, UserType.MODERATOR)
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  //   @UseGuards(JwtAuthGuard, RolesGuard, UserTypeGuard)
  //   @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  //   @UserTypes(UserType.ADMIN, UserType.MODERATOR)
  //   @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.eventService.remove(id);
  }

  @Post(':id/register')
  //   @UseGuards(JwtAuthGuard)
  //   @HttpCode(HttpStatus.OK)
  async registerUser(
    @Param('id') eventId: string,
    @Request() req: any,
  ): Promise<EventResponseDto> {
    const userId = req.user.userId;
    return this.eventService.registerUser(eventId, userId);
  }

  @Post(':id/unregister')
  //   @UseGuards(JwtAuthGuard)
  //   @HttpCode(HttpStatus.OK)
  async unregisterUser(
    @Param('id') eventId: string,
    @Request() req: any,
  ): Promise<EventResponseDto> {
    const userId = req.user.userId;
    return this.eventService.unregisterUser(eventId, userId);
  }

  @Get('user/registered')
  //   @UseGuards(JwtAuthGuard)
  async getUserRegisteredEvents(
    @Request() req: any,
    @Query() queryDto: EventQueryDto,
  ): Promise<EventListResponseDto> {
    const userId = req.user.userId;

    // Add filter to only show events where user is registered
    const modifiedQuery = {
      ...queryDto,
      registeredUser: userId,
    };

    return this.eventService.findAll(modifiedQuery);
  }

  @Get('upcoming/featured')
  async getFeaturedUpcomingEvents(
    @Query('limit') limit?: number,
  ): Promise<EventResponseDto[]> {
    const queryDto: EventQueryDto = {
      status: 'Upcoming' as any,
      visibility: 'Public' as any,
      limit: limit || 5,
      page: 1,
      sortBy: 'date',
      sortOrder: 'asc',
    };

    const result = await this.eventService.findAll(queryDto);
    return result.events;
  }

  @Post('upload-banner')
  @UseInterceptors(
    FileInterceptor('bannerImage', multerConfig),
    FileUploadInterceptor,
  )
  async uploadBanner(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ bannerImageUrl: string }> {
    return {
      bannerImageUrl: req.body.bannerImage,
    };
  }
}
