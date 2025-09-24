import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import {
  EventResponseDto,
  EventListResponseDto,
} from './dto/event-response.dto';
import { EventStatus, EventVisibility } from './enums/event.enum';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<EventResponseDto> {
    try {
      // Validate that paid events have pricing ranges
      if (
        createEventDto.isPaidEvent &&
        (!createEventDto.pricingRanges ||
          createEventDto.pricingRanges.length === 0)
      ) {
        throw new BadRequestException(
          'Pricing ranges are required for paid events',
        );
      }

      // Set default values
      const eventData = {
        ...createEventDto,
        status: createEventDto.status || EventStatus.UPCOMING,
        visibility: createEventDto.visibility || EventVisibility.PUBLIC,
        registeredCount: 0,
        registeredUsers: [],
        socialMediaLinks: createEventDto.socialMediaLinks || {},
        pricingRanges: createEventDto.pricingRanges || [],
      };

      const createdEvent = new this.eventModel(eventData);
      const savedEvent = await createdEvent.save();

      return this.mapToResponseDto(savedEvent);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create event: ${error.message}`);
    }
  }

  async findAll(queryDto: EventQueryDto): Promise<EventListResponseDto> {
    try {
      const {
        search,
        status,
        visibility,
        dateFrom,
        dateTo,
        page = 1,
        limit = 10,
        sortBy = 'date',
        sortOrder = 'asc',
      } = queryDto;

      // Build filter object
      const filter: any = {};

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } },
          { fullDescription: { $regex: search, $options: 'i' } },
          { organizerName: { $regex: search, $options: 'i' } },
          { venue: { $regex: search, $options: 'i' } },
        ];
      }

      if (status) {
        filter.status = status;
      }

      if (visibility) {
        filter.visibility = visibility;
      }

      if (dateFrom || dateTo) {
        filter.date = {};
        if (dateFrom) {
          filter.date.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          filter.date.$lte = new Date(dateTo);
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      const [events, total] = await Promise.all([
        this.eventModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        this.eventModel.countDocuments(filter).exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        events: events.map((event) => this.mapToResponseDto(event)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch events: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<EventResponseDto> {
    try {
      const event = await this.eventModel.findById(id).exec();

      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      return this.mapToResponseDto(event);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch event: ${error.message}`);
    }
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    try {
      // Validate that paid events have pricing ranges
      if (
        updateEventDto.isPaidEvent &&
        (!updateEventDto.pricingRanges ||
          updateEventDto.pricingRanges.length === 0)
      ) {
        throw new BadRequestException(
          'Pricing ranges are required for paid events',
        );
      }

      const updatedEvent = await this.eventModel
        .findByIdAndUpdate(id, updateEventDto, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedEvent) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      return this.mapToResponseDto(updatedEvent);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(`Failed to update event: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const deletedEvent = await this.eventModel.findByIdAndDelete(id).exec();

      if (!deletedEvent) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      return { message: 'Event deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete event: ${error.message}`);
    }
  }

  async registerUser(
    eventId: string,
    userId: string,
  ): Promise<EventResponseDto> {
    try {
      const event = await this.eventModel.findById(eventId).exec();

      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      // Check if user is already registered
      if (event.registeredUsers.includes(userId)) {
        throw new BadRequestException(
          'User is already registered for this event',
        );
      }

      // Check if event has available seats
      if (event.registeredCount >= event.seatLimit) {
        throw new BadRequestException('Event is fully booked');
      }

      // Add user to registered users and increment count
      event.registeredUsers.push(userId);
      event.registeredCount = event.registeredUsers.length;

      const updatedEvent = await event.save();
      return this.mapToResponseDto(updatedEvent);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to register user: ${error.message}`,
      );
    }
  }

  async unregisterUser(
    eventId: string,
    userId: string,
  ): Promise<EventResponseDto> {
    try {
      const event = await this.eventModel.findById(eventId).exec();

      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      // Check if user is registered
      if (!event.registeredUsers.includes(userId)) {
        throw new BadRequestException('User is not registered for this event');
      }

      // Remove user from registered users and decrement count
      event.registeredUsers = event.registeredUsers.filter(
        (id) => id !== userId,
      );
      event.registeredCount = event.registeredUsers.length;

      const updatedEvent = await event.save();
      return this.mapToResponseDto(updatedEvent);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to unregister user: ${error.message}`,
      );
    }
  }

  private mapToResponseDto(event: EventDocument): EventResponseDto {
    return {
      _id: event._id.toString(),
      title: event.title,
      shortDescription: event.shortDescription,
      fullDescription: event.fullDescription,
      bannerImage: event.bannerImage,
      date: event.date,
      startsTime: event.startsTime,
      venue: event.venue,
      googleMapLink: event.googleMapLink,
      organizerName: event.organizerName,
      organizerContactInfo: event.organizerContactInfo,
      specialGuests: event.specialGuests,
      isPaidEvent: event.isPaidEvent,
      pricingRanges: event.pricingRanges,
      seatLimit: event.seatLimit,
      socialMediaLinks: event.socialMediaLinks,
      status: event.status as EventStatus,
      visibility: event.visibility as EventVisibility,
      registeredCount: event.registeredCount,
      registeredUsers: event.registeredUsers,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
