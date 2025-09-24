import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event, EventSchema } from './schemas/event.schema';
import { CloudinaryService } from './services/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    ConfigModule,
  ],
  controllers: [EventController],
  providers: [EventService, CloudinaryService],
  exports: [EventService, CloudinaryService],
})
export class EventModule {}
