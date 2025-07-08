import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqsCategoryService } from './faqs-category.service';
import { FaqsCategoryController } from './faqs-category.controller';
import {
  FaqsCategory,
  FaqsCategorySchema,
} from './schemas/faqs-category.schema';
import { Faqs, FaqsSchema } from '../faqs/schemas/faqs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FaqsCategory.name,
        schema: FaqsCategorySchema,
      },
      {
        name: Faqs.name,
        schema: FaqsSchema,
      },
    ]),
  ],
  controllers: [FaqsCategoryController],
  providers: [FaqsCategoryService],
  exports: [FaqsCategoryService],
})
export class FaqsCategoryModule {}
