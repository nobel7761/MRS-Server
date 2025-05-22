import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RepresentativeCollectionService } from './representative-collection.service';
import { RepresentativeCollectionController } from './representative-collection.controller';
import {
  RepresentativeCollection,
  RepresentativeCollectionSchema,
} from './schemas/representative-collection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RepresentativeCollection.name,
        schema: RepresentativeCollectionSchema,
      },
    ]),
  ],
  controllers: [RepresentativeCollectionController],
  providers: [RepresentativeCollectionService],
  exports: [RepresentativeCollectionService],
})
export class RepresentativeCollectionModule {}
