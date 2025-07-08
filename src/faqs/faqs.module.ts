import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { Faqs, FaqsSchema } from './schemas/faqs.schema';
import { FaqsCategoryModule } from '../faqs-category/faqs-category.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Faqs.name,
        schema: FaqsSchema,
      },
    ]),
    FaqsCategoryModule,
  ],
  controllers: [FaqsController],
  providers: [FaqsService],
  exports: [FaqsService],
})
export class FaqsModule {}
