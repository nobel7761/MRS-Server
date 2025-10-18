import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SilverJubileeService } from './silver-jubilee.service';
import { SilverJubileeController } from './silver-jubilee.controller';
import {
  SilverJubileeParticipant,
  SilverJubileeParticipantSchema,
} from './schemas/silver-jubilee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SilverJubileeParticipant.name,
        schema: SilverJubileeParticipantSchema,
      },
    ]),
  ],
  controllers: [SilverJubileeController],
  providers: [SilverJubileeService],
  exports: [SilverJubileeService],
})
export class SilverJubileeModule {}
